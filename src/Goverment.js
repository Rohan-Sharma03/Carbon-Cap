// Government.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import CarbonCapData from "./truffle_abis/CarbonCap.json";

const Government = ({ account, balance }) => {
  const navigate = useNavigate();
  const [governmentAddress, setGovernmentAddress] = useState("");
  const [carbonCapContract, setCarbonCapContract] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    // Function to initialize Web3 and set up contract
    const initializeWeb3 = async () => {
      // Check if MetaMask or similar is installed
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        try {
          // Request access to user accounts
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Get network ID and deployed contract information
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = CarbonCapData.networks[networkId];
          const contract = new web3Instance.eth.Contract(
            CarbonCapData.abi,
            deployedNetwork && deployedNetwork.address
          );

          // Set Carbon Cap contract and fetch government address
          setCarbonCapContract(contract);
          const government = await contract.methods
            .getGovernmentBodyAddress()
            .call();
          setGovernmentAddress(government);
          console.log("Goverment Address: ", governmentAddress);
        } catch (error) {
          console.error("Error initializing web3:", error);
        }
      } else {
        console.error("Please install MetaMask or enable Ethereum provider.");
      }
    };

    initializeWeb3();
  }, []);

  useEffect(() => {
    console.log("Government Address:", governmentAddress);
  }, [governmentAddress]);

  const handleCertifyOrganization = async () => {
    try {
      // Logic to certify organization
      // ...
    } catch (error) {
      setTransactionStatus(`Failed to certify organization: ${error.message}`);
    }
  };

  const handleSetRegistrationFee = async () => {
    try {
      const fee = parseInt(registrationFee); // Parse registrationFee to integer if needed

      // Check if fee is a positive number
      if (isNaN(fee) || fee <= 0) {
        throw new Error("Registration fee should be a positive number.");
      }

      // Call the setRegistrationFee function in the smart contract
      const gas = await carbonCapContract.methods
        .setRegistrationFee(fee)
        .estimateGas();
      const tx = await carbonCapContract.methods
        .setRegistrationFee(fee)
        .send({ from: account, gas });

      // Transaction successful - Update UI or show success message
      setTransactionStatus(`Registration fee set to ${fee} ETH`);
    } catch (error) {
      // Transaction failed - Handle error and update UI
      setTransactionStatus(`Failed to set registration fee: ${error.message}`);
    }
  };

  const handleFactory = () => {
    navigate("/factory");
  };

  const handleOrganization = () => {
    navigate("/organization");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 bg-gray-100">
      <h1 className="text-3xl font-bold underline mb-4">Government</h1>
      <div className="bg-white rounded-lg shadow-md p-6 w-80">
        {/* Set Registration Fee */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Set Registration Fee</h2>
          <input
            type="number"
            placeholder="Fee (ETH)"
            className="border rounded-md px-3 py-2 mb-2 w-full"
            value={registrationFee}
            onChange={(e) => setRegistrationFee(e.target.value)}
          />
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
            onClick={handleSetRegistrationFee}
          >
            Set Fee
          </button>
          {/* Transaction status display */}
          {transactionStatus && (
            <p className="text-red-500 mt-2">{transactionStatus}</p>
          )}
        </div>

        {/* Certify Organization */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Certify Organization</h2>
          <input
            type="text"
            placeholder="Organization Address"
            className="border rounded-md px-3 py-2 mb-2 w-full"
            value={organizationAddress}
            onChange={(e) => setOrganizationAddress(e.target.value)}
          />
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md"
            onClick={handleCertifyOrganization}
          >
            Certify
          </button>
          {/* Transaction status display */}
          {transactionStatus && (
            <p className="text-red-500 mt-2">{transactionStatus}</p>
          )}
        </div>
        <div className="flex justify-between mt-4 gap-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
            onClick={handleFactory}
          >
            Go to Factory
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
            onClick={handleOrganization}
          >
            Go to Organization
          </button>
        </div>
      </div>
    </div>
  );
};

export default Government;
