const Migrations = artifacts.require("HistoriaClinica.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
