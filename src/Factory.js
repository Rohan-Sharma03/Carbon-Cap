import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useNavigate, useSearchParams } from "react-router-dom";
import CarbonCapData from "./truffle_abis/CarbonCap.json";

const Factory = ({ account }) => {
  const [web3, setWeb3] = useState(null);
  const [carbonCapContract, setCarbonCapContract] = useState(null);
  const [factoryAddress, setFactoryAddress] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState("");
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [emissions, setEmissions] = useState("");
  const [dataSubmitted, setDataSubmitted] = useState(false);

  const [params] = useSearchParams();
  const factory = params.get("factoryAddress");
  console.log(factory);
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

    // if (account) {
    //   setFactoryAddress(factory);
    // }
    setFactoryAddress("0x0853D0946768c102DC987e32c9d17a186803f950");
    initializeWeb3();
  }, [account]);

  const handleRecordEmissions = async () => {
    try {
      if (!web3.utils.isAddress(factoryAddress)) {
        throw new Error("Invalid factory address");
      }

      const emissionsValue = parseInt(emissions);
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
      if (!web3.utils.isAddress(organizationAddress)) {
        throw new Error("Invalid Organization address");
      }

      const creditAmt = parseInt(creditsAmount);
      if (isNaN(creditAmt) || creditAmt <= 0) {
        throw new Error("Invalid credit amount");
      }

      const gas = await carbonCapContract.methods
        .buyCreditsFromOrganization(organizationAddress, creditAmt)
        .estimateGas({ from: factoryAddress });

      await carbonCapContract.methods
        .buyCreditsFromOrganization(organizationAddress, creditAmt)
        .send({ from: factoryAddress, gas });

      // Specify the amount of Ether to transfer
      const etherAmount = 0.1; // Example: 0.1 Ether

      // Sending Ether to the organization's address
      await web3.eth.sendTransaction({
        to: organizationAddress,
        from: factoryAddress,
        value: web3.utils.toWei(etherAmount.toString(), "ether"),
      });

      console.log("Credits purchased successfully and Ether transferred.");
      // Provide user feedback or update UI
    } catch (error) {
      if (
        error.message.includes("MetaMask - RPC Error: Internal JSON-RPC error")
      ) {
        // Show the error message in an alert box
        window.alert(error.data);
      } else {
        // For other errors, display a generic error message
        window.alert("An error occurred: " + error.message);
      }
      console.error(
        "Error while buying credits and transferring Ether:",
        error
      );
      // Handle errors if any
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold underline mb-4">Factory</h1>

      {/* Display Factory Address */}
      <p className="text-lg mb-4">Factory Address: {factoryAddress}</p>

      {/* Record Emissions */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Record Emissions</h2>
        <input
          type="number"
          placeholder="Enter Emissions (MTCO2e)"
          className="border rounded-md px-3 py-2 mb-2 w-full"
          value={emissions}
          onChange={(e) => setEmissions(e.target.value)}
        />

        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
          onClick={handleRecordEmissions}
        >
          Record Emissions
        </button>
        {/* Display submission status */}
        {dataSubmitted && (
          <p className="text-green-500 mt-2">
            Emissions data submitted successfully!
          </p>
        )}
      </div>

      {/* Buy Credits Section */}
      <div>
        <h2>Buy Credits</h2>
        <input
          type="text"
          placeholder="Enter Organization Address"
          value={organizationAddress}
          onChange={(e) => setOrganizationAddress(e.target.value.toString())}
          className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:border-blue-500"
        />

        <br />
        <br />
        <input
          type="number"
          placeholder="Enter Credits Amount"
          value={creditsAmount}
          onChange={(e) => setCreditsAmount(e.target.value)}
          className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:border-blue-500"
        />

        <br />
        <br />
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
