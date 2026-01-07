import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
//import { configVariable } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();


const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_URL = process.env.API_URL;

if (PRIVATE_KEY === undefined) {
  console.error("PRIVATE_KEY is not defined");
  throw new Error("PRIVATE_KEY is not defined");
}

if (API_URL === undefined) {
  console.error("API_URL is not defined");
  throw new Error("API_URL is not defined");
}

const isCoverage = process.env.COVERAGE === "true";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    version: isCoverage ? "0.8.20" : "0.8.30",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: API_URL, // with hardhat keystore: configVariable("SEPOLIA_RPC_URL"), it requires a password for every run
      accounts: [PRIVATE_KEY],
    },
    links: {
      type: "http",
      chainType: "op",
      url: "https://json-rpc.evm.stardust.linksfoundation.com/dtcb-chain",
      accounts: [PRIVATE_KEY],
      chainId: 1074,
    },
    iota: {
      type: "http",
      chainType: "op",
      url: "https://json-rpc.evm.testnet.iota.cafe",
      chainId: 1076,
      accounts: [PRIVATE_KEY],
    },
  },

  chainDescriptors: {
    // LINKS chain
    1074: {
      name: "links",
      blockExplorers: {
        blockscout: {
          name: "Blockscout-LINKS",
          url: "https://explorer.tangle.stardust.linksfoundation.com",
          apiUrl: "https://explorer.tangle.stardust.linksfoundation.com/api",
        },
      },
    },
  },
};

export default config;
