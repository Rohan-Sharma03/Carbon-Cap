import React, { useState, useEffect } from "react";
import Web3 from "web3";
import CarbonCapData from "./truffle_abis/CarbonCap.json"; // Import the ABI and bytecode

const Factory = ({ account }) => {
  const [web3, setWeb3] = useState(null);
  const [carbonCapContract, setCarbonCapContract] = useState(null);
  const [emissionsValue, setEmissionsValue] = useState(0); // State to store emissions value
  const [factoryAddress, setFactoryAddress] = useState(""); // State to store the factory address
  const governmentAddress = account; // Replace with the government body's Ethereum address
  const [isDataSubmitted, setIsDataSubmitted] = useState(false); // State to track data submission status

  useEffect(() => {
    // Initialize Web3 when the component mounts
    async function initializeWeb3() {
      if (window.ethereum) {
        const newWeb3 = new Web3(window.ethereum);
        setWeb3(newWeb3);

        try {
          // Request account access if needed
          await window.ethereum.request({ method: "eth_requestAccounts" });

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

  // Function to handle factory registration
  const handleRegisterFactory = async () => {
    try {
      // Check if the factory address is a valid Ethereum address
      if (!web3.utils.isAddress(factoryAddress)) {
        throw new Error("Invalid factory address");
      }
      

      // Estimate gas required for the transaction
      const gas = await carbonCapContract.methods
        .registerFactory(factoryAddress)
        .estimateGas({ from: governmentAddress });

      // Send the transaction to register the factory
      const tx = await carbonCapContract.methods
        .registerFactory(factoryAddress)
        .send({
          from: governmentAddress,
          gas: gas,
        });

      console.log("Factory registered successfully!");
      // Add UI updates or further logic upon successful registration
    } catch (error) {
      console.error("Error while registering factory:", error);
      // Handle error scenarios (display error message, update UI, etc.)
    }
  };
  // Function to handle recording emissions by the factory
  const handleRecordEmissions = async () => {
    try {
      if (!web3.utils.isAddress(factoryAddress)) {
        throw new Error("Factory Ethereum address not available");
      }

      if (isNaN(emissionsValue) || emissionsValue <= 0) {
        throw new Error("Invalid emissions value");
      }

      // Call the recordEmissions function from the contract
      const gas = await carbonCapContract.methods
        .recordEmissions(emissionsValue)
        .estimateGas({ from: factoryAddress });

      const tx = await carbonCapContract.methods
        .recordEmissions(emissionsValue)
        .send({ from: factoryAddress, gas });

      console.log("Emissions recorded successfully!", tx);
      setIsDataSubmitted(true); // Set the data submission status
      // Add further logic or UI updates upon successful recording
    } catch (error) {
      console.error("Error while recording emissions:", error);
      // Handle error scenarios (display error message, update UI, etc.)
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold underline">Factory</h1>
        <div className="mb-4">
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
          {/* Add status message for factory registration */}
        </div>
        <div>
          <p>Factory component</p>
          {/* Input for factory address */}
          <input
            type="text"
            placeholder="Enter Factory Address"
            value={factoryAddress}
            onChange={(e) => setFactoryAddress(e.target.value)}
          />
          {/* Input for recording emissions */}
          <input
            type="number"
            placeholder="Enter Emissions (MTCO2e)"
            value={emissionsValue}
            onChange={(e) => setEmissionsValue(Number(e.target.value))}
          />
          {/* Button to record emissions */}
          <button onClick={handleRecordEmissions}>Record Emissions</button>
          {/* Display submission status */}
          {isDataSubmitted && <p>Emissions data submitted successfully!</p>}
          {/* Other elements and functionalities */}
        </div>
      </div>
    </div>
  );
};

export default Factory;
