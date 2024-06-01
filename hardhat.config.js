require("@nomicfoundation/hardhat-toolbox");
require('solidity-coverage');
require('hardhat-gas-reporter');

/** @type import('hardhat/config').HardhatUserConfig */

const ZIRCUIT_PRIVATE_KEY1 = "386e891edb5c40917ff3eb0d8ca2bf6dc94849c4cfa94dadccf2ca31221fc259";
const ZIRCUIT_PRIVATE_KEY2 = "ef9a1d961c5739294e411b8580da2ec820eca93421b4279a84602e5b0a47f130";

module.exports = {
  solidity: "0.8.24",
  networks: {
    zircuit: {
      url: `https://zircuit1.p2pify.com`,
      accounts: [ZIRCUIT_PRIVATE_KEY1 , ZIRCUIT_PRIVATE_KEY2]
    }
  },
  gasReporter: {
    enabled: true,
  },
  etherscan: {
    apiKey: {
      zircuit: '9E7798192CE9CC67FC542DD957324020E5'
    }, 
    customChains: [
      {
        network: 'zircuit',
        chainId: 48899,
        urls: {
          apiURL: 'https://explorer.zircuit.com/api/contractVerifyHardhat',
          browserURL: 'https://explorer.zircuit.com',
        },
      }
    ]
  }
};
