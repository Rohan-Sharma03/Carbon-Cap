var Migration = artifacts.require("./CarbonCap.sol");

module.exports = function (deployer) {
  deployer.deploy(Migration);
};
