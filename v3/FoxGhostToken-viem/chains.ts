// src/chains.ts
import { defineChain } from "viem";
import { configVariable } from "hardhat/config";

export const linksChain = defineChain({
  id: 1074,
  name: "links",
  nativeCurrency: { name: "LINKS", symbol: "LINKS", decimals: 18 },
  // opzionale: utile come documentazione
  rpcUrls: { default: { http: [process.env.LINKS_RPC_URL ?? ""] } },
  blockExplorers: {
    default: {
      name: "Blockscout-LINKS",
      url: "https://explorer.tangle.stardust.linksfoundation.com",
    },
  },
});
