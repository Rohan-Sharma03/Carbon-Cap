import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Web3 from "web3";
import Factory from "./Factory";
import Government from "./Goverment";
import Organization from "./Organization";

function App() {
  const [connectedAccount, setConnectedAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.enable();
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          console.log("Connected account:", accounts[0]);
          setConnectedAccount(accounts[0]);

          const balance = await web3Instance.eth.getBalance(accounts[0]);
          console.log("Account balance:", balance);
          setAccountBalance(web3Instance.utils.fromWei(balance, "ether"));
        } catch (error) {
          console.error("User denied account access or other error:", error);
        }
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        // Use window.web3 for Ethereum interactions (legacy)
      } else {
        window.alert("No Ethereum browser detected.");
      }
    };

    loadWeb3();
  }, []); // Empty dependency array to run this effect only once on mount

  return (
    <div>
      <div>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <Government
                  account={connectedAccount}
                  balance={accountBalance}
                />
              }
            />
            <Route
              path="/factory"
              element={<Factory account={connectedAccount} />}
            />
            <Route
              path="/organization"
              element={<Organization account={connectedAccount} />}
            />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
