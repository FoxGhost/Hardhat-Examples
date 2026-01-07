// customChains.ts
import { defineChain } from "viem";

export const linksChain = defineChain({
  id: 1074,
  name: "links",
  nativeCurrency: { name: "LINKS", symbol: "LINKS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.evm.stardust.linksfoundation.com/dtcb-chain'],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout-LINKS",
      url: "https://explorer.tangle.stardust.linksfoundation.com",
    },
  },
});
