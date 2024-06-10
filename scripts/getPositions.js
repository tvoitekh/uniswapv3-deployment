/*
  npx hardhat run --network zircuit scripts/getPositions.js

  This script will get all the positions owned by the first signer,
  and print the details of each position to the console.
*/

require('dotenv').config() // Load environment variables from the .env file

// Uniswap contract addresses from the .env file
TETHER_ADDRESS = process.env.TETHER_ADDRESS
USDC_ADDRESS = process.env.USDC_ADDRESS
WRAPPED_BITCOIN_ADDRESS = process.env.WRAPPED_BITCOIN_ADDRESS
WETH_ADDRESS = process.env.WETH_ADDRESS
FACTORY_ADDRESS = process.env.FACTORY_ADDRESS
SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS
NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS
POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS
POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS

// Import contract artifacts
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
};

const { Contract } = require("ethers") // Import the Contract class from ethers.js

async function main() {
  const [signer] = await ethers.getSigners(); // Get the first signer from the provider
  const provider = ethers.provider // Get the default provider

  // Create instances of the NonfungiblePositionManager and NonfungibleTokenPositionDescriptor contracts
  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )

  const nonfungibleTokenPositionDescriptor = new Contract(
    POSITION_DESCRIPTOR_ADDRESS,
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    provider
  )

  // Get the total number of positions owned by the signer
  const balanceOfUser = await nonfungiblePositionManager.balanceOf(signer.address);
  console.log(`Balance of user: ${balanceOfUser}`);

  // Loop through all the positions owned by the signer
  for (let i = 0; i < balanceOfUser; i++) {
    // Get the token ID of the position
    const tokenId = await nonfungiblePositionManager.tokenOfOwnerByIndex(signer.address, i);
    // Get the details of the position
    const position = await nonfungibleTokenPositionDescriptor.positions(tokenId);

    // Print the details of the position
    console.log(`Position ${i + 1}:`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`Token 0: ${position.token0}`);
    console.log(`Token 1: ${position.token1}`);
    console.log(`Fee: ${position.fee}`);
    console.log(`Tick Lower: ${position.tickLower}`);
    console.log(`Tick Upper: ${position.tickUpper}`);
    console.log(`Liquidity: ${position.liquidity}`);
    console.log(`------------`);
  }
}


main()
  .then(() => process.exit(0)) // Exit with success
  .catch((error) => {
    console.error(error); // Log any errors
    process.exit(1); // Exit with failure
  });