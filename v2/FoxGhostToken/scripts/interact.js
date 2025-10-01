const { ethers } = require("hardhat");

const decimals = BigInt(10**18)
const totalSupply = decimals * BigInt(1000);
const value = BigInt(5)*decimals;
let iterationsNumber = 10;

async function main(){

    const FoxGhostToken = await ethers.getContractFactory('FoxGhostToken');
    //links
    //const Token = await FoxGhostToken.attach('0xF915B288a6da9130Da1629D471648b987621D989');
    //shimmer
    //const Token = await FoxGhostToken.attach('0xfE4e461a94B7459eF12F48Fa2A63D5D820fFc8a3');
    //sepolia
    const Token = await FoxGhostToken.attach('0x8Afb6d79cf0aAF18e2fCa5f7C2c089036C583105');


    let [owner, addr1, addr2] = await ethers.getSigners();
    addr1 = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
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
    tx = await Token.mint(owner, totalSupply);
    rc = await tx.wait();
    end = performance.now();
    mintGasUsed += Number(rc.gasUsed);
    mintTime += Math.round(end - start)
    
    start = performance.now();
    tx = await Token.mint(addr1, totalSupply);
    rc = await tx.wait();
    end = performance.now();
    mintToGasUsed += Number(rc.gasUsed);
    mintToTime += Math.round(end - start);
    
    start = performance.now();
    tx = await Token.transfer(addr1, value)
    rc = await tx.wait();
    end = performance.now();
    transferGasUsed += Number(rc.gasUsed);
    transferTime += Math.round(end - start);

    start = performance.now();
    tx = await Token.burn(value);
    rc = await tx.wait();
    end = performance.now();
    burnGasUsed += Number(rc.gasUsed);
    burnTime += Math.round(end - start);

    start = performance.now();
    tx = await Token.approve(addr1, value);
    rc = await tx.wait();
    end = performance.now();
    approveGasUsed += Number(rc.gasUsed);
    approveTime += Math.round(end - start);

    n++
    console.log(n);
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