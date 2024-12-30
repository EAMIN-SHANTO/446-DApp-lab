// // requiring the contract
// var patientManagement = artifacts.require("./patientManagement.sol");

// // exporting as module 
//  module.exports = function(deployer) {
//   deployer.deploy(patientManagement);
//  };


// Requiring the contract
var PatientManagement = artifacts.require("./PatientManagement.sol");

// Exporting as a module
module.exports = function (deployer) {
  deployer.deploy(PatientManagement);
};
