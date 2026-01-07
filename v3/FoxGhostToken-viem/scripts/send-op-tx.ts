import { linksChain } from "../customChains.js";
import {createPublicClient, createWalletClient, http} from 'viem'
import {privateKeyToAccount} from "viem/accounts";
import dotenv from "dotenv";
dotenv.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
console.log(process.env.HARDHAT_NETWORK)


if (PRIVATE_KEY === undefined) {
  console.error("PRIVATE_KEY is not defined");
  throw new Error("PRIVATE_KEY is not defined");
}

const account = privateKeyToAccount(PRIVATE_KEY)
//console.log(account)

const publicClient = createPublicClient({ chain: linksChain, transport: http() });
//console.log("PUBLIC CLIENT:", pubCl)

//const { viem: hhViem } = await network.connect();
console.log("Sending transaction using the OP chain type");

//console.log(publicClient.chain.name, publicClient.chain.id)

const walletClient = createWalletClient({account, chain: linksChain, transport: http() })

//console.log("WALLET:", walletClient)

console.log("Sending 1 wei from", walletClient.account.address, "to itself");

const l1Gas = await publicClient.estimateGas({
    account: walletClient.account.address,
    to: walletClient.account.address,
    value: 1n,
  });


console.log("Estimated gas:", l1Gas);

console.log("Sending transaction");
const tx = await walletClient.sendTransaction({
  to: walletClient.account.address,
  value: 1n,
});

await publicClient.waitForTransactionReceipt({ hash: tx });

console.log("Transaction sent successfully");
