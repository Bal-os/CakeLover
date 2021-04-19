const DToken = artifacts.require("DToken");

module.exports = function (deployer) {
  deployer.deploy(DToken);
};
