/*
To run this script:
npx hardhat run --network zircuit scripts/deploy_Quoter.js
*/

const { ContractFactory } = require("ethers");

const fs = require('fs');
const { promisify } = require('util');

const artifacts = {
  Quoter: require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json"),
};

async function main() {
  const [owner , addr1] = await ethers.getSigners();

  require('dotenv').config();
  const factoryAddress = process.env.FACTORY_ADDRESS;
  console.log(factoryAddress);
  const wethAddress = process.env.WETH_ADDRESS;

  Quoter = new ContractFactory(artifacts.Quoter.abi, artifacts.Quoter.bytecode, owner);
  quoter = await Quoter.deploy(factoryAddress, wethAddress);

  let additionalAddresses = [
    `QUOTER_ADDRESS=${quoter.address}`
  ];

  const appendFile = promisify(fs.appendFile);
  const filePath = '.env';
  return appendFile(filePath, '\n' + additionalAddresses.join('\n'))
      .then(() => {
        console.log('Additional addresses recorded.');
      })
      .catch((error) => {
        console.error('Error logging addresses:', error);
        throw error;
      });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
