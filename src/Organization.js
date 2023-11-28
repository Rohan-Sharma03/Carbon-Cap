import React, { useState, useEffect } from "react";
import Web3 from "web3";
import CarbonCapData from "./truffle_abis/CarbonCap.json";

const Organization = ({ account }) => {
  const [web3, setWeb3] = useState(null);
  const [governmentAddress, setGovernmentAddress] = useState("");
  const [carbonCapContract, setCarbonCapContract] = useState(null);
  const [registrationFee, setRegistrationFee] = useState("");
  // const [selectedAccount, setSelectedAccount] = useState(null);
  const [organizationAddress, setOrganizationAddress] = useState(""); // Added organization address state

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
          console.log("Goverment Address: ", governmentAddress);
          setGovernmentAddress(account);
        } catch (error) {
          console.error("Error initializing web3:", error);
        }
      } else {
        console.error("Please install MetaMask or enable Ethereum provider.");
      }
    };
    initializeWeb3();
  }, []);

  const handlePayRegistrationFee = async () => {
    try {
      if (!web3.utils.isAddress(organizationAddress)) {
        throw new Error("Invalid account address");
      }

      const fees = parseInt(registrationFee);

      if (isNaN(fees) || fees <= 0) {
        throw new Error("Invalid fees amount");
      }

      console.log("Organization: ", organizationAddress);
      console.log("Fees set :", fees);
      // const gas = await carbonCapContract.methods
      //   .payRegistrationFee()
      //   .estimateGas({ from: organizationAddress });

      const tx = await carbonCapContract.methods.payRegistrationFee().send({
        from: organizationAddress,
        to: governmentAddress,
        value: Number(fees * 1e18),
      });

      console.log(tx.blockHash, "submit the organization feess");

      console.log("Registration fee paid successfully!");
      // Handle UI updates or further logic upon successful payment
    } catch (error) {
      console.error("Error while paying registration fee:", error);
      // Handle error scenarios (display error message, update UI, etc.)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-10/12">
        <h1 className="text-3xl font-bold mb-4">Organization</h1>
        <p className="text-lg mb-4">
          Organizaiton Address: {organizationAddress}
        </p>
        <div className="mb-4">
          <label
            htmlFor="organizationAddress"
            className="block text-gray-700 font-semibold mb-2"
          >
            Organization Address
          </label>
          <input
            id="organizationAddress"
            type="text"
            placeholder="Enter Your Organization Address"
            value={organizationAddress}
            onChange={(e) => setOrganizationAddress(e.target.value)}
            className="border rounded-md px-3 py-2 w-full focus:outline-none focus:border-blue-500"
          />

          <label
            htmlFor="registrationFee"
            className="block text-gray-700 font-semibold mb-2 mt-4"
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
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-4 w-full"
          >
            Pay Registration Fee
          </button>
        </div>
      </div>
    </div>
  );
};

export default Organization;
