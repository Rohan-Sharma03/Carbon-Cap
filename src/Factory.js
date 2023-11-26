// Factory.js

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import CarbonCapData from "./truffle_abis/CarbonCap.json";

const Factory = ({ account }) => {
  const [web3, setWeb3] = useState(null);
  const [carbonCapContract, setCarbonCapContract] = useState(null);
  const [emissionsValue, setEmissionsValue] = useState(0);
  const [factoryAddress, setFactoryAddress] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState(0); // Added state for creditsAmount

  useEffect(() => {
    async function initializeWeb3() {
      if (window.ethereum) {
        const newWeb3 = new Web3(window.ethereum);
        setWeb3(newWeb3);

        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });

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

  const handleRegisterFactory = async () => {
    try {
      if (!web3.utils.isAddress(factoryAddress)) {
        throw new Error("Invalid factory address");
      }

      const gas = await carbonCapContract.methods
        .registerFactory(factoryAddress)
        .estimateGas({ from: account });

      await carbonCapContract.methods
        .registerFactory(factoryAddress)
        .send({ from: account, gas });

      console.log("Factory registered successfully!");
      // Provide user feedback or update UI
    } catch (error) {
      console.error("Error while registering factory:", error);
      // Handle error scenarios
    }
  };

  const handleRecordEmissions = async () => {
    try {
      if (!web3.utils.isAddress(factoryAddress)) {
        throw new Error("Invalid factory address");
      }

      if (isNaN(emissionsValue) || emissionsValue <= 0) {
        throw new Error("Invalid emissions value");
      }

      const gas = await carbonCapContract.methods
        .recordEmissions(emissionsValue)
        .estimateGas({ from: factoryAddress });

      await carbonCapContract.methods
        .recordEmissions(emissionsValue)
        .send({ from: factoryAddress, gas });

      setIsDataSubmitted(true);
      console.log("Emissions recorded successfully!");
      // Provide user feedback or update UI
    } catch (error) {
      console.error("Error while recording emissions:", error);
      // Handle error scenarios
    }
  };

  const handleBuyCredits = async () => {
    try {
      // Placeholder for handling buying credits logic
      // Implement the logic for buying credits here based on your requirements
      console.log("Buying credits logic will be implemented here.");
    } catch (error) {
      // Handle errors if any
      console.error("Error while buying credits:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold underline mb-4">Factory</h1>
      {/* Factory Registration */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Factory Registration</h2>
        <input
          type="text"
          placeholder="Enter Factory Address"
          className="border rounded-md px-3 py-2 mb-2 w-full"
          value={factoryAddress}
          onChange={(e) => setFactoryAddress(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          onClick={handleRegisterFactory}
        >
          Register Factory
        </button>
        {/* Display registration status */}
      </div>

      {/* Record Emissions */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Record Emissions</h2>
        <input
          type="number"
          placeholder="Enter Emissions (MTCO2e)"
          className="border rounded-md px-3 py-2 mb-2 w-full"
          value={emissionsValue}
          onChange={(e) => setEmissionsValue(Number(e.target.value))}
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
          onClick={handleRecordEmissions}
        >
          Record Emissions
        </button>
        {/* Display submission status */}
        {isDataSubmitted && (
          <p className="text-green-500 mt-2">
            Emissions data submitted successfully!
          </p>
        )}
      </div>

      {/* Buy Credits Section */}
      <div>
        <h2>Buy Credits</h2>
        <input
          type="number"
          placeholder="Enter Credits Amount"
          value={creditsAmount}
          onChange={(e) => setCreditsAmount(Number(e.target.value))}
          className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleBuyCredits}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Buy Credits
        </button>
      </div>
    </div>
  );
};

export default Factory;
