/*
  npx hardhat run --network zircuit scripts/02_deployTokens.js

  This script deploys the Tether, UsdCoin, and WrappedBitcoin contracts,
  mints 100,000 tokens of each to a secondary signer,
  and writes the contract addresses to the .env file.
*/


const fs = require('fs'); // Import the built-in file system module
const { promisify } = require('util'); // Import the promisify utility from the built-in util module

async function main() {
  const [owner, signer2] = await ethers.getSigners(); // Get the first two signers from the provider

  // Deploy the Tether contract using the first signer (owner)
  Tether = await ethers.getContractFactory('Tether', owner);
  tether = await Tether.deploy();

  // Deploy the UsdCoin contract using the first signer (owner)
  Usdc = await ethers.getContractFactory('UsdCoin', owner);
  usdc = await Usdc.deploy();

  // Deploy the WrappedBitcoin contract using the first signer (owner)
  WrappedBitcoin = await ethers.getContractFactory('WrappedBitcoin', owner);
  wrappedBitcoin = await WrappedBitcoin.deploy();

  // Mint 100,000 Tether tokens to the second signer
  await tether.connect(owner).mint(
    signer2.address,
    ethers.utils.parseEther('100000')
  );

  // Mint 100,000 UsdCoin tokens to the second signer
  await usdc.connect(owner).mint(
    signer2.address,
    ethers.utils.parseEther('100000')
  );

  // Mint 100,000 WrappedBitcoin tokens to the second signer
  await wrappedBitcoin.connect(owner).mint(
    signer2.address,
    ethers.utils.parseEther('100000')
  );

  // Prepare the address data to be written to the .env file
  let addresses = [
    `USDC_ADDRESS=${usdc.address}`,
    `TETHER_ADDRESS=${tether.address}`,
    `WRAPPED_BITCOIN_ADDRESS=${wrappedBitcoin.address}`,
  ];
  const data = '\n' + addresses.join('\n'); // Join the addresses with newlines

  // Promisify the fs.appendFile function to use async/await
  const writeFile = promisify(fs.appendFile);
  const filePath = '.env'; // Path to the .env file

  // Append the address data to the .env file
  return writeFile(filePath, data)
    .then(() => {
      console.log('Addresses recorded.'); // Log a success message
    })
    .catch((error) => {
      console.error('Error logging addresses:', error); // Log any errors
      throw error; // Re-throw the error to propagate it
    });
}


main()
  .then(() => process.exit(0)) // Exit with success
  .catch((error) => {
    console.error(error); // Log any errors
    process.exit(1); // Exit with failure
  });