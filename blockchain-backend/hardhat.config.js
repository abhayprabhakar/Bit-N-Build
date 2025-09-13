require("@nomiclabs/hardhat-ethers");
require("dotenv").config({ path: '../.env' }); // Look for .env in parent directory

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: `http://${process.env.BLOCKCHAIN_HOST}:${process.env.BLOCKCHAIN_PORT}`,
      chainId: parseInt(process.env.NETWORK_ID)
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};