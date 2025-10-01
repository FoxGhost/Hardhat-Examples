const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    //console.log("DEPLOYER: " + deployer);
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const FoxGhostToken = await ethers.deployContract("FoxGhostToken");
    console.log("FoxGhostToken address:", await FoxGhostToken.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });