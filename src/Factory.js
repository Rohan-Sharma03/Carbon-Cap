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
  const [gastype, setGasType] = useState("");

  const [params] = useSearchParams();
  const factory = params.get("factoryAddress");

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
      } else {
        console.error("Please install MetaMask or enable Ethereum provider.");
      }
    }

    initializeWeb3();
  }, []);

  const handleRecordEmissions = async () => {
    try {
      if (!web3.utils.isAddress(factoryAddress)) {
        throw new Error("Invalid factory address");
      }

      const emissionsValue = parseInt(emissions);
      if (isNaN(emissionsValue) || emissionsValue <= 0) {
        throw new Error("Invalid emissions value");
      }

      const tx = await carbonCapContract.methods
        .recordEmissions(emissionsValue)
        .send({ from: factoryAddress });

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

      const tx = await carbonCapContract.methods
        .buyCreditsFromOrganization(organizationAddress, creditAmt)
        .send({
          from: factoryAddress,
          to: organizationAddress,
          value: 2 * Number(creditAmt * 1e18),
        });

      console.log("Credits purchased successfully and Ether transferred.");
      // Provide user feedback or update UI
    } catch (error) {
      console.error(
        "Error while buying credits and transferring Ether:",
        error
      );
      // Handle errors if any
    }
  };

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto p-4 bg-gray-100 h-screen w-4/5">
        <h1 className="text-3xl font-bold underline mb-6">Factory</h1>
        {/* Display Factory Address */}
        <p className="text-lg mb-4">Factory Address: {factoryAddress}</p>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Record Emissions</h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Enter Your Factory Address"
              value={factoryAddress}
              onChange={(e) => setFactoryAddress(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Enter type of Gas e.g CO2"
              value={gastype}
              onChange={(e) => setGasType(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Enter Emissions (MTCO2e)"
              value={emissions}
              onChange={(e) => setEmissions(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
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
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Buy Credits</h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Enter Organization Address"
              value={organizationAddress}
              onChange={(e) =>
                setOrganizationAddress(e.target.value.toString())
              }
              className="border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Enter Credits Amount"
              value={creditsAmount}
              onChange={(e) => setCreditsAmount(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleBuyCredits}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Buy Credits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Factory;
