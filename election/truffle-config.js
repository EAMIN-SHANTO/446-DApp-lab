module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8586,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8586
    }
  },

  compilers: {
    solc:{
      version: "0.8.16",
      //  exact version 0.8.16
      settings: {
        optimizer: {
          enabled: true, 
          runs: 200,
        },
      }
    },
  },



  
};

