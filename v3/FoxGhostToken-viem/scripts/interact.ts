import hre, { network } from "hardhat";
import { linksChain } from "../customChains.js";
import {BaseError, ContractFunctionRevertedError, parseEventLogs} from "viem";

async function main() {
    const { viem } = await network.connect(); // connection to the network declared with `--network` available in `hardhat.config.ts`

    console.log(hre.globalOptions.network) //this is the value declared with `--network`
    let publicClient
    let wallet;
    let contract;

    /* if the network is a custom network
    * * the network won't be recognized by viem, and it will generate the error `HHE40000: Network not found`
    * * to avoid this error, declare your network, in this case in `customChains.ts` and import it.
    * * Then every client, wallet and contract instance needs to be declared specifying the custom chain.
    * *
    * * In this example with this if,
    * * there is a separation between the creation of client, wallet and contract
    * * when my custom network `links` is used.
    * *
    * * This if is not strictly needed because the issue
    * * `HHE40000: Network not found` is just a problem with viem
    * * that cannot find the network that Hardhat is using between the viem known networks.
    * *
    * * If the custom network is left hardcoded,
    * * but a different one is used through the param
    * * `--network` like `--network sepolia`
    * * the script will work with Sepolia Network without any problem
    * * even if viem is thinking to work on your custom network.
    * *
    * * But to avoid not tested issue with this approach, it is better to split the cases with an if
    * */

    if (hre.globalOptions.network === "links") { //create objects for the custom network
        publicClient = await viem.getPublicClient({chain: linksChain});
        [wallet] = await viem.getWalletClients({ chain: linksChain });
        contract = await viem.getContractAt(
            "FoxGhostToken",
            "0xEed2586f340344351173970A0d02E55d9E8F3335",
            { client: { public: publicClient, wallet } }
        );
    }
    else { //create objects for any viem known network
        publicClient = await viem.getPublicClient();
        [wallet] = await viem.getWalletClients();
        contract = await viem.getContractAt(
            "FoxGhostToken",
            "0xEed2586f340344351173970A0d02E55d9E8F3335"
        );
    }
    /* Print client connection details
    *  * Note, for example, that if using sepolia network
    * * the rpc printed won't be the same present in `hardhat.config.ts`.
    * * This is just because here are printed the details from viem,
    * * but the communication is done through Hardhat and the configuration in `hardhat.config.ts`
    *  */
    console.log(publicClient.chain.name, publicClient.chain.id, publicClient.chain.rpcUrls.default.http[0]);

    console.log("wallet:", wallet.account.address);

    console.log("blockNumber:", await publicClient.getBlockNumber());


    //console.log("contract:", contract);

    /* Read the contract state
    *  * every call to the Smart Contract must be called with read if it is not modifying the state
    *  */
    console.log("balanceOf:", await contract.read.balanceOf([wallet.account.address]));
    console.log(await contract.read.owner());
    console.log(await contract.read.totalSupply());

    /* Send a transaction to the Smart Contract
    * * every tx to the Smart Contract must be sent with `write` because it is modifying the state.
    * *
    * * The error handling in case of a revert must be done here because viem is simulating tx
    * * before sending it.
    *  */
    let tx = await contract.write.mint([wallet.account.address, BigInt(100)])
        .catch((e) => {
            const error = e as BaseError;
            let reverted = error.walk() as ContractFunctionRevertedError;
            console.log(reverted.data?.errorName, reverted.data?.args);
        });

    let rc, events;

    /* Event reading
     * * To read an event if the transaction is ok can be done in two ways
     * * 1. without specifying the event name but just the contract,
     * * in this case all the contract event for that tx will be read
     * *
     * * 2. specifying the event name, in this case just the events with that name are captured
     * */

    if (tx !== undefined) {
        rc = await publicClient.waitForTransactionReceipt({hash: tx});
        events = parseEventLogs({
            abi: contract.abi,                  //match all the events of the contract
            logs: rc.logs,
            eventName: "Transfer",             //exact event filter
        });
        console.log(
            "event:", events[0].eventName, "-",
            "from:", events[0].args.from, "-",
            "to:", events[0].args.to, "-",
            "value:", events[0].args.value
        );
    }

    tx = await contract.write.transfer(["0x02F7A04fBD4c782bb857BB7cC4185e1e7cc97017", BigInt(100)])
        .catch((e) => {
            const error = e as BaseError;
            let reverted = error.walk() as ContractFunctionRevertedError;
            console.log("Error: ", reverted.data?.errorName, reverted.data?.args);
        });


    if (tx !== undefined) {
        console.log("Tx Hash:",tx)
        rc = await publicClient.waitForTransactionReceipt({hash: tx});
        //console.log(rc);
        console.log(rc.status);

        events = parseEventLogs({
            abi: contract.abi,                  //match all the events of the contract
            logs: rc.logs,
            eventName: "Transfer",             //exact event filter
        });


        for (const e of events) {
            /* If the parsing is matching all the events of the contract
            * * the matching is on all the possible events of the contract
            * * so is not possible to know the fields inside args
            *  */
            //console.log("event:", e.eventName, "args:", e.args);

            /* The parsing is matching exactly an event
            *  * in this case the fields inside args are known, and it is possible to access them
            *  */
            console.log(
                "event:", e.eventName, "-",
                "from:", e.args.from, "-",
                "to:", e.args.to, "-",
                "value:", e.args.value
            );

        }
    }

    console.log(wallet.account.address, await contract.read.balanceOf([wallet.account.address]))
    console.log("0x02F7A04fBD4c782bb857BB7cC4185e1e7cc97017", await contract.read.balanceOf(["0x02F7A04fBD4c782bb857BB7cC4185e1e7cc97017"]));

}


main().catch((e) => {
    console.error(e);
    process.exit(1);
});
