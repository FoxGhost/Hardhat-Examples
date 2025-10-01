
// scripts/send-tx.ts
import { getViemClients } from "../viemClients";

const { publicClient, walletClient } = await getViemClients();

console.log("Invio 1 wei da", walletClient.account.address, "a se stesso");
const hash = await walletClient.sendTransaction({
  to: walletClient.account.address,
  value: 1n,
});
await publicClient.waitForTransactionReceipt({ hash });
console.log("OK:", hash);
