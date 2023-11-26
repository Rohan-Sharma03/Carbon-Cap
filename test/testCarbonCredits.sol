// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/CarbonCap.sol";

contract TestCarbonCredits {
    // The address of the CarbonCredits contract to be tested
    CarbonCredits carbonCredits = CarbonCredits(DeployedAddresses.CarbonCredits());

    // Testing issuance of carbon credits
    function testIssueCarbonCredits() public {
        uint creditsIssued = carbonCredits.issueCredits(100); // Assuming 100 credits issued

        Assert.equal(creditsIssued, 100, "Issued credits should match expected amount");
    }

    // Testing transfer of carbon credits
    function testTransferCarbonCredits() public {
        uint initialBalance = carbonCredits.getCreditsBalance(address(this)); // Get initial balance of this contract
        address receiver = address(0x123); // Replace with a valid address for testing

        carbonCredits.issueCredits(100); // Issuing credits to this contract
        carbonCredits.transferCredits(receiver, 50); // Transferring 50 credits to the receiver

        uint finalBalance = carbonCredits.getCreditsBalance(address(this)); // Get final balance after transfer

        Assert.equal(finalBalance, initialBalance + 50, "Receiver should receive 50 credits");
    }

    // Testing retrieval of credits balance
    function testGetCreditsBalance() public {
        uint balance = carbonCredits.getCreditsBalance(address(this)); // Get credits balance of this contract

        Assert.equal(balance, 0, "Initial balance should be 0");
    }


}
