require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PKEY1 = process.env.PKEY1
const INFURA_API_KEY = process.env.INFURA_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.21",
  networks: {
    'links': {
      url: 'http://192.168.94.12/wasp/api/v1/chains/tst1pq475hdk6ym4y5my0xfq0t0euznkwyq8q4tyh3r0z4fnr65vvxx3zmc6jk0/evm',
      chainId: 1074,
      accounts:[PRIVATE_KEY, PKEY1]
    },
    'shimmer': {
      url: 'https://json-rpc.evm.testnet.shimmer.network',
      chainId: 1073,
      accounts: [PRIVATE_KEY, PKEY1],
    },
    'sepolia': {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  },
};
