import hre, { network } from "hardhat";
import { linksChain } from "../customChains.js";

async function main() {
    const { viem } = await network.connect();

    //console.log(viem)

    console.log(hre.globalOptions.network)
    let publicClient = undefined;
    let [wallet] = [];

    if (hre.globalOptions.network === "links") {
        publicClient = await viem.getPublicClient({chain: linksChain});
        [wallet] = await viem.getWalletClients({ chain: linksChain });
    }
    else {
        publicClient = await viem.getPublicClient();
        [wallet] = await viem.getWalletClients();
    }
    console.log(publicClient.chain.name, publicClient.chain.id, publicClient.chain.rpcUrls.default.http[0]);
    console.log("wallet:", wallet.account.address);

    console.log("blockNumber:", await publicClient.getBlockNumber());

    const contract = viem.getContract("FoxGhostToken");
    console.log("contract:", contract);



}


main().catch((e) => {
    console.error(e);
    process.exit(1);
});
