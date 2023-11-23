App = {
  web3Provider: null,
  contracts: {},
  carbonCapContractInstance: null,

  init: async function () {
    // Load CarbonCap contract.
    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fallback to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("CarbonCap.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CarbonCapArtifact = data;
      App.contracts.CarbonCap = TruffleContract(CarbonCapArtifact);

      // Set the provider for our contract
      App.contracts.CarbonCap.setProvider(App.web3Provider);

      // Initialize the contract instance
      App.getCarbonCapContractInstance();

      // Bind events
      return App.bindEvents();
    });
  },

  getCarbonCapContractInstance: async function () {
    try {
      App.carbonCapContractInstance = await App.contracts.CarbonCap.deployed();
    } catch (error) {
      console.error("Error getting CarbonCap contract instance:", error);
    }
  },

  bindEvents: function () {
    $(document).on("click", ".btn-record-emissions", App.handleRecordEmissions);
    $(document).on("click", ".btn-purchase-credits", App.handlePurchaseCredits);
    // Add more event bindings for your contract interactions
  },

  handleRecordEmissions: function (event) {
    event.preventDefault();
    var emissions = parseInt($("#emissionsValue").val());
    App.carbonCapContractInstance
      .recordEmissions(emissions, { from: "YOUR_FACTORY_ADDRESS" })
      .then(function (result) {
        // Handle success
        console.log("Emissions recorded:", result);
      })
      .catch(function (err) {
        // Handle errors
        console.error("Error recording emissions:", err);
      });
  },

  handlePurchaseCredits: function (event) {
    event.preventDefault();
    var amount = parseInt($("#creditsValue").val());
    var organizationAddress = "ORGANIZATION_ADDRESS";
    App.carbonCapContractInstance
      .purchaseCredits(amount, organizationAddress, {
        from: "YOUR_FACTORY_ADDRESS",
      })
      .then(function (result) {
        // Handle success
        console.log("Credits purchased:", result);
      })
      .catch(function (err) {
        // Handle errors
        console.error("Error purchasing credits:", err);
      });
  },

  // Add more functions to interact with other functionalities of the contract
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
