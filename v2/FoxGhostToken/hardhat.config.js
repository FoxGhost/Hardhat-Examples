require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PKEY1 = process.env.PKEY1
const INFURA_API_KEY = process.env.INFURA_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.30",
  networks: {
    'links': {
      url: 'https://json-rpc.evm.stardust.linksfoundation.com/dtcb-chain',
      chainId: 1074,
      accounts:[PRIVATE_KEY, PKEY1]
    },
    iota: {
      url: "https://json-rpc.evm.testnet.iota.cafe",
      chainId: 1076,
      accounts: [PRIVATE_KEY, PKEY1],
    },
    'sepolia': {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  },
};
