import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import CarbonCapData from "./truffle_abis/CarbonCap.json"; // Import the ABI and bytecode

const Government = ({ account, balance }) => {
  const navigate = useNavigate();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [deployedAddress, setDeployedAddress] = useState("");

  const [amount, setAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [factoryEmissionsList, setFactoryEmissionsList] = useState([]);
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const governmentAddress = deployedAddress;
  const [organizationAddress, setOrganizationAddress] = useState();
  const [carbonCapContract, setCarbonCapContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [registrationFee, setRegistrationFee] = useState("");
  const [dataIndex, setDataIndex] = useState(0);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        try {
          // Request account access if needed
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Get the contract instance
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = CarbonCapData.networks[networkId];
          setDeployedAddress(deployedNetwork.address);
          const contract = new web3Instance.eth.Contract(
            CarbonCapData.abi,
            deployedNetwork && deployedNetwork.address
          );

          setCarbonCapContract(contract);

          // Rest of your initialization logic...
        } catch (error) {
          console.error("Error initializing web3:", error);
        }
      } else {
        console.error("Please install MetaMask or enable Ethereum provider.");
      }
    };

    initializeWeb3();
  }, []);

  const handleCertifyOrganization = async () => {
    try {
      const contract = carbonCapContract;
      const gas = await contract.methods
        .certifyOrganization(organizationAddress)
        .estimateGas({ from: governmentAddress });

      const tx = await contract.methods
        .certifyOrganization(organizationAddress)
        .send({
          from: governmentAddress,
          gas: gas,
        });

      console.log("Organization registered successfully!");
      // Additional logic upon successful registration
      setTransactionStatus(`Organization ${organizationAddress} certified`);
    } catch (error) {
      console.error("Error while registering Organization:", error);
      // Handle error scenarios (display error message, update UI, etc.)
      setTransactionStatus(`Failed to certify organization: ${error.message}`);
    }
  };

  const handleVerifyEmissions = async (factoryAddress, dataIndex) => {
    try {
      const web3 = new Web3(window.ethereum);

      const contractAddress = account;
      const contract = new web3.eth.Contract(
        CarbonCapData.abi,
        contractAddress
      );

      const gas = await contract.methods
        .verifyEmissions(factoryAddress, dataIndex)
        .estimateGas();
      const tx = await contract.methods
        .verifyEmissions(factoryAddress, dataIndex)
        .send({ from: account, gas });

      console.log("Transaction hash:", tx.transactionHash);
      setTransactionStatus(
        `Emissions data verified for factory ${factoryAddress}`
      );
    } catch (error) {
      setTransactionStatus(`Failed to verify emissions data: ${error.message}`);
    }
  };

  const handleSetRegistrationFee = async (fee) => {
    if (!web3.utils.isAddress(deployedAddress)) {
      throw new Error("Invalid government address");
    }
    try {
      const gas = await carbonCapContract.methods
        .setRegistrationFee(fee)
        .estimateGas();
      const tx = await carbonCapContract.methods
        .setRegistrationFee(fee)
        .send({ from: deployedAddress, gas });

      console.log("Transaction hash:", tx.transactionHash);
      setTransactionStatus(`Registration fee set to ${fee} ETH`);
    } catch (error) {
      setTransactionStatus(`Failed to set registration fee: ${error.message}`);
    }
  };

  const handleTransfer = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const amountWei = web3.utils.toWei(amount, "ether");
      await web3.eth.sendTransaction({
        from: account,
        to: recipientAddress,
        value: amountWei,
      });

      setTransactionStatus(
        `Successfully sent ${amount} ETH to ${recipientAddress}`
      );
    } catch (error) {
      setTransactionStatus(`Transaction failed: ${error.message}`);
    }
  };

  // const handleCertifyOrganization = async (organizationAddress) => {
  //   try {
  //     // Check if the factory address is a valid Ethereum address
  //     if (!web3.utils.isAddress(organizationAddress)) {
  //       throw new Error("Invalid organization  address");
  //     }

  //     // Estimate gas required for the transaction
  //     const gas = await carbonCapContract.methods
  //       .certifyOrganization(organizationAddress)
  //       .estimateGas({ from: governmentAddress });

  //     // Send the transaction to register the organization
  //     const tx = await carbonCapContract.methods
  //       .certifyOrganization(organizationAddress)
  //       .send({
  //         from: governmentAddress,
  //         gas: gas,
  //       });

  //     console.log("Organization registered successfully!");
  //     // Add UI updates or further logic upon successful registration
  //   } catch (error) {
  //     console.error("Error while registering Orgaization:", error);
  //     // Handle error scenarios (display error message, update UI, etc.)
  //   }
  //   // try {
  //   //   const web3 = new Web3(window.ethereum);
  //   //   const contractAddress = account; // Replace with your deployed contract address
  //   //   const contract = new web3.eth.Contract(
  //   //     CarbonCapData.abi,
  //   //     contractAddress
  //   //   );

  //   //   const gas = await contract.methods
  //   //     .certifyOrganization(organizationAddress)
  //   //     .estimateGas();
  //   //   const tx = await contract.methods
  //   //     .certifyOrganization(organizationAddress)
  //   //     .send({ from: account, gas });

  //   //   console.log("Transaction hash:", tx.transactionHash);
  //   //   setTransactionStatus(`Organization ${organizationAddress} certified`);
  //   // } catch (error) {
  //   //   setTransactionStatus(`Failed to certify organization: ${error.message}`);
  //   // }
  // };

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
        <div className="mb-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Factory Emissions</h2>
            {noRecordsFound ? (
              <p>No factory emissions found.</p>
            ) : (
              <ul>
                {factoryEmissionsList.map((item, index) => (
                  <li key={index} className="mb-2">
                    Factory: {item.factory}
                    <br />
                    Emissions: {item.emissions}
                    {account === governmentAddress && (
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md ml-4"
                        onClick={() =>
                          handleVerifyEmissions(item.factory, dataIndex)
                        }
                      >
                        Verify
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p>
            <strong>Connected Account:</strong> {account}
          </p>
          <p>
            <strong>Account Balance:</strong> {balance} ETH
          </p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Transfer ETH</h2>
          <input
            type="text"
            placeholder="Recipient Address"
            className="border rounded-md px-3 py-2 mb-2 w-full"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount (ETH)"
            className="border rounded-md px-3 py-2 mb-2 w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            onClick={handleTransfer}
          >
            Transfer
          </button>
          {transactionStatus && (
            <p className="text-red-500 mt-2">{transactionStatus}</p>
          )}
        </div>
        <div className="flex justify-between">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
            onClick={handleFactory}
          >
            Factory View
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
            onClick={handleOrganization}
          >
            Organization View
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Set Registration Fee</h2>
          <input
            type="number"
            placeholder="Fee (ETH)"
            className="border rounded-md px-3 py-2 mb-2 w-full"
            value={registrationFee}
            onChange={(e) => setRegistrationFee(e.target.value)} // Update the state here
          />
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
            onClick={() => handleSetRegistrationFee(registrationFee)}
          >
            Set Fee
          </button>
          {transactionStatus && (
            <p className="text-red-500 mt-2">{transactionStatus}</p>
          )}
        </div>
      </div>
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
          onClick={() => handleCertifyOrganization(organizationAddress)}
        >
          Certify
        </button>
        {transactionStatus && (
          <p className="text-red-500 mt-2">{transactionStatus}</p>
        )}
      </div>
    </div>
  );
};

export default Government;
