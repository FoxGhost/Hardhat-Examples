
// src/viemClients.ts
import { network } from "hardhat";
import type { Chain } from "viem";
import { linksChain } from "./chains";

// mappa "nome rete" -> chain Viem custom (solo dove serve)
const chainByNetwork: Record<string, Chain | undefined> = {
  links: linksChain, // la tua rete custom
  // sepolia: undefined, // reti standard Viem non richiedono override
};

export async function getViemClients() {
  // Rispetta l'opzione --network del CLI
  const { viem } = await network.connect();

  // Se la rete corrente ha una chain custom, passala ai getter
  const chain = chainByNetwork[network.name];

  const publicClient = await viem.getPublicClient(chain ? { chain } : {});
  const [walletClient] = await viem.getWalletClients(chain ? { chain } : {});
  return { publicClient, walletClient };
}
