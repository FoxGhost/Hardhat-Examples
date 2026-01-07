import hre, { network } from "hardhat";
import { linksChain } from "../customChains.js";
import {getAddress} from "viem";

const { viem } = await network.connect(); // connection to the network declared with `--network` available in `hardhat.config.ts`

const decimals = BigInt(10**18)
const totalSupply = decimals * BigInt(1000);
const value = BigInt(5)*decimals;
let iterationsNumber = 1;

async function main(){

    const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

    if (contractAddress === undefined) {
        throw new Error("CONTRACT_ADDRESS not defined");
    } else {
        console.log("CONTRACT_ADDRESS:", contractAddress);
    }

    console.log(hre.globalOptions.network) //this is the value declared with `--network`
    let publicClient
    let wallet;
    let contract;

    if (hre.globalOptions.network === "links") { //create objects for the custom network
        publicClient = await viem.getPublicClient({chain: linksChain});
        [wallet] = await viem.getWalletClients({ chain: linksChain });
        contract = await viem.getContractAt(
            "FoxGhostToken",
            contractAddress,
            { client: { public: publicClient, wallet } }
        );
    }
    else { //create objects for any viem known network
        publicClient = await viem.getPublicClient();
        [wallet] = await viem.getWalletClients();
        contract = await viem.getContractAt(
            "FoxGhostToken",
            contractAddress
        );
    }

    let addr1 = '0x02F7A04fBD4c782bb857BB7cC4185e1e7cc97017' as `0x${string}`;
    /*
      let tx = await Token.mint(owner, totalSupply);
      let rc = await tx.wait();
      console.log('Mint gas cost ' + rc.gasUsed)
      console.log(await Token.name())
    */

    let tx, rc, mintGasUsed = 0, mintToGasUsed = 0, transferGasUsed = 0
    let burnGasUsed = 0, approveGasUsed = 0, n = 0;
    let start = 0, end = 0,  mintTime = 0, mintToTime = 0, transferTime = 0;
    let burnTime = 0, approveTime = 0;

    for (let i = 0; i < iterationsNumber; i++) {

        start = performance.now();
        tx = await contract.write.mint([wallet.account.address, totalSupply]);
        rc = await publicClient.waitForTransactionReceipt({hash: tx});
        end = performance.now();
        mintGasUsed += Number(rc.gasUsed);
        mintTime += Math.round(end - start)

        start = performance.now();
        tx = await contract.write.mint([addr1, totalSupply]);
        rc = await publicClient.waitForTransactionReceipt({hash: tx});
        end = performance.now();
        mintToGasUsed += Number(rc.gasUsed);
        mintToTime += Math.round(end - start);

        start = performance.now();
        tx = await contract.write.transfer([getAddress(addr1), value])
        rc = await publicClient.waitForTransactionReceipt({hash: tx});
        end = performance.now();
        transferGasUsed += Number(rc.gasUsed);
        transferTime += Math.round(end - start);

        start = performance.now();
        tx = await contract.write.burn([value]);
        rc = await publicClient.waitForTransactionReceipt({hash: tx});
        end = performance.now();
        burnGasUsed += Number(rc.gasUsed);
        burnTime += Math.round(end - start);

        start = performance.now();
        tx = await contract.write.approve([getAddress(addr1), value]);
        rc = await publicClient.waitForTransactionReceipt({hash: tx});
        end = performance.now();
        approveGasUsed += Number(rc.gasUsed);
        approveTime += Math.round(end - start);

        n++
        console.log(n);
        console.log();
    }
    //console.log('Total Gas Used', gasUsed);
    console.log('mintGasUsed Mean Gas Used ', Math.floor(mintGasUsed/n));
    console.log('mint mean time ', Math.round(mintTime/n));
    console.log();

    console.log('mintToGasUsed Mean Gas Used ', Math.floor(mintToGasUsed/n));
    console.log('mintTo mean time ', Math.round(mintToTime/n));
    console.log();

    console.log('transferGasUsed Mean Gas Used ', Math.floor(transferGasUsed/n));
    console.log('transfer mean time ', Math.round(transferTime/n));
    console.log();

    console.log('burnGasUsed Mean Gas Used ', Math.floor(burnGasUsed/n));
    console.log('burn mean time ', Math.round(burnTime/n));
    console.log();

    console.log('approveGasUsed Mean Gas Used ', Math.floor(approveGasUsed/n));
    console.log('approve mean time ', Math.round(approveTime/n));
    console.log();

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });