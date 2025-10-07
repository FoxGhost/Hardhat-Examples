import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.30",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
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
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
    links: {
      type: "http",
      chainType: "l1",
      url: configVariable("LINKS_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
      chainId: 1074,
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
