import React, { useState, useEffect } from "react";
import Web3 from "web3";
import CarbonCapData from "./truffle_abis/CarbonCap.json"; // Import the ABI and bytecode

const Organization = () => {
  const [web3, setWeb3] = useState(null);
  const [carbonCapContract, setCarbonCapContract] = useState(null);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [creditsAmount, setCreditsAmount] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    // Initialize Web3 when the component mounts
    async function initializeWeb3() {
      if (window.ethereum) {
        const newWeb3 = new Web3(window.ethereum);
        setWeb3(newWeb3);

        try {
          // Request account access if needed
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Get the selected account
          const accounts = await newWeb3.eth.getAccounts();
          setSelectedAccount(accounts[0]); // Select the first account by default

          // Get the contract instance
          const networkId = await newWeb3.eth.net.getId();
          const deployedNetwork = CarbonCapData.networks[networkId];
          const contract = new newWeb3.eth.Contract(
            CarbonCapData.abi,
            deployedNetwork && deployedNetwork.address
          );
          setCarbonCapContract(contract);
        } catch (error) {
          console.error("Error while initializing web3:", error);
        }
      }
    }

    initializeWeb3();
  }, []);

  const handlePayRegistrationFee = async () => {
    try {
      if (!web3.utils.isAddress(selectedAccount)) {
        throw new Error("Invalid account address");
      }

      const gas = await carbonCapContract.methods
        .payRegistrationFee()
        .estimateGas({ from: selectedAccount, value: registrationFee });

      await carbonCapContract.methods.payRegistrationFee().send({
        from: selectedAccount,
        value: registrationFee,
        gas: gas,
      });

      console.log("Registration fee paid successfully!");
      // Handle UI updates or further logic upon successful payment
    } catch (error) {
      console.error("Error while paying registration fee:", error);
      // Handle error scenarios (display error message, update UI, etc.)
    }
  };

  // Function to update selected account when changed in MetaMask
  const handleAccountChange = async () => {
    const accounts = await web3.eth.getAccounts();
    setSelectedAccount(accounts[0]);
  };

  // Event listener to watch for account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountChange);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Organization</h1>
        <div className="mb-4">
          <label
            htmlFor="registrationFee"
            className="block text-gray-700 font-semibold mb-2"
          >
            Registration Fee (in Ether)
          </label>
          <input
            id="registrationFee"
            type="number"
            placeholder="Enter Registration Fee"
            value={registrationFee}
            onChange={(e) => setRegistrationFee(Number(e.target.value))}
            className="border rounded-md px-3 py-2 w-full focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handlePayRegistrationFee}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-2"
          >
            Pay Registration Fee
          </button>
        </div>
      </div>
    </div>
  );
};

export default Organization;
