// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

/**
 * @title CarbonCap
 * @dev Manages emissions monitoring and carbon credit transactions for factories.
 */
contract CarbonCap {
    // Structure to store emissions data for a factory
    struct EmissionsData {
        uint emissions; // Emissions in metric tons of carbon dioxide equivalent (MTCO2e)
        bool dataSubmitted; // Indicates if emissions data is submitted
        address verifier; // Address of the entity verifying the emissions data
        bool verified; // Indicates if emissions data is verified
        uint timestamp; // Timestamp when emissions data is recorded
    }

    // Structure to represent carbon credits
    struct CarbonCredit {
        uint amount; // Amount of carbon credits in MTCO2e
        address organization; // Organization providing carbon credits
    }

    address payable public governmentBody;
    address payable[] public registeredFactories;
    address payable[] public registeredOrganizations;

    mapping(address => EmissionsData[]) public factoryEmissions;
    mapping(address => CarbonCredit) public availableCredits;
    mapping(address => bool) public certifiedOrganizations;
    mapping(address => uint) public registrationFeesPaid;

    uint public registrationFee;
    bool public registrationFeeFinalized;

    event RegistrationFeePaid(address indexed payer, uint amount);
    event CreditsPurchased(address indexed buyer, address indexed organization, uint amount);

    // Modifier to check if the registration fee is finalized
    modifier registrationFeeIsFinalized() {
        require(registrationFeeFinalized, "Registration fee is not finalized yet.");
        _;
    }

    // Modifier to check if the sender is the government body
    modifier onlyGovernmentBody() {
        require(msg.sender == governmentBody, "Only government body can perform this action.");
        _;
    }

    // Modifier to check if the sender is a registered organization
    modifier onlyRegisteredOrganization() {
        require(certifiedOrganizations[msg.sender], "Only registered organizations can perform this action.");
        _;
    }

    // Modifier to check if the sender is a registered factory
    modifier onlyRegisteredFactory() {
        require(isRegisteredFactory(msg.sender), "Only registered factories can perform this action.");
        _;
    }

    constructor() payable {
        governmentBody = payable(msg.sender);
    }

    // Function to register a factory by the government body
    function registerFactory(address factory) public onlyGovernmentBody {
        registeredFactories.push(payable(factory));
    }

    // Function to record emissions data by registered factories
    function recordEmissions(uint emissions) public onlyRegisteredFactory {
        require(emissions > 0, "Emissions data must be greater than zero MTCO2e.");
        require(availableCredits[msg.sender].amount >= emissions, "Insufficient available credits.");

        availableCredits[msg.sender].amount -= emissions;

        factoryEmissions[msg.sender].push(EmissionsData({
            emissions: emissions,
            dataSubmitted: true,
            verifier: address(0),
            verified: false,
            timestamp: block.timestamp
        }));
    }

    // Function to verify emissions data by the government body
    function verifyEmissions(address factory, uint dataIndex) public onlyGovernmentBody {
        EmissionsData storage data = factoryEmissions[factory][dataIndex];
        require(data.dataSubmitted, "No emissions data submitted at this index.");
        require(!data.verified, "Emissions data already verified.");

        data.verifier = msg.sender;
        data.verified = true;
    }

    // Function to get the total verified emissions for a factory
    function getTotalEmissions(address factory) public view returns (uint totalEmissions) {
        uint emissionsCount = factoryEmissions[factory].length;
        for (uint i = 0; i < emissionsCount; i++) {
            if (factoryEmissions[factory][i].verified) {
                totalEmissions += factoryEmissions[factory][i].emissions;
            }
        }
    }

    // Function to get available credits for a factory
    function getAvailableCredits(address factory) public view returns (uint creditsAvailable) {
        creditsAvailable = availableCredits[factory].amount;
    }

    // Function to set the registration fee by the government body
    function setRegistrationFee(uint fee) external onlyGovernmentBody {
        require(fee > 0, "Registration fee should be greater than zero.");
        registrationFee = fee;
        registrationFeeFinalized = true; // Marking registration fee as finalized
    }

    // Function for registered organizations to pay the registration fee
    function payRegistrationFee() external payable onlyRegisteredOrganization {
        registrationFeesPaid[msg.sender] += msg.value; // Track the fee paid by the organization
        payable(governmentBody).transfer(registrationFee);
        emit RegistrationFeePaid(msg.sender, msg.value); // Log the registration fee payment
    }

    // Function for registered factories to buy credits from a certified organization
    function buyCreditsFromOrganization(address payable organization, uint creditsAmount) external onlyRegisteredFactory {
        require(certifiedOrganizations[organization], "Organization is not certified.");
        require(creditsAmount > 0, "Credits amount should be greater than zero.");

        uint creditsPrice = creditsAmount * 2; // Calculate the price for the requested credits
        require(address(this).balance >= creditsPrice, "Insufficient Ether balance in the contract.");

        organization.transfer(creditsPrice); // Transfer Ether (2 times the credits price) to the organization

        availableCredits[msg.sender].amount += creditsAmount; // Update factory's available credits
        availableCredits[msg.sender].organization = organization;

        emit CreditsPurchased(msg.sender, organization, creditsAmount); // Log the purchase of credits
    }

    // Function for the government body to withdraw Ether from the contract
    function withdrawEther(uint amount) external onlyGovernmentBody {
        require(amount <= address(this).balance, "Insufficient contract balance.");
        payable(governmentBody).transfer(amount);
    }

    // Function for the government body to certify an organization
    function certifyOrganization(address organization) public onlyGovernmentBody registrationFeeIsFinalized {
        certifiedOrganizations[organization] = true;
        registeredOrganizations.push(payable(organization));
    }

    // Internal function to check if an address is a registered factory
    function isRegisteredFactory(address _address) internal view returns (bool) {
        for (uint i = 0; i < registeredFactories.length; i++) {
            if (registeredFactories[i] == _address) {
                return true;
            }
        }
        return false;
    }
}
