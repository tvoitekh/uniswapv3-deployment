/*
  npx hardhat run --network zircuit scripts/03_deployPools.js

  This script deploys a new Uniswap V3 pool for the USDT/USDC token pair
  with a fee tier of 500 and an initial price of 1:1.
  The address of the deployed pool is then written to the .env file.
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
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Contract, BigNumber } = require("ethers") // Import the Contract and BigNumber classes from ethers.js
const bn = require('bignumber.js') // Import the bignumber.js library for BigNumber math operations
const {promisify} = require("util"); // Import the promisify utility from the built-in util module
const fs = require("fs"); // Import the built-in file system module
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 }) // Configure bignumber.js settings

const provider = ethers.provider // Get the default provider

// Function to encode the sqrt price for the pool
function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

// Create instances of the NonfungiblePositionManager and UniswapV3Factory contracts
const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
)

const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
)

// Function to deploy a new Uniswap V3 pool
async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners(); // Get the first signer from the provider

  // Call the createAndInitializePoolIfNecessary function to deploy the pool
  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }
  )
  // Get the address of the deployed pool
  const poolAddress = await factory.connect(owner).getPool(
    token0,
    token1,
    fee,
  )
  return poolAddress
}

async function main() {
  // Deploy a new USDT/USDC pool with a fee tier of 500 and an initial price of 1:1
  const usdtUsdc500 = await deployPool(TETHER_ADDRESS, USDC_ADDRESS,  500, encodePriceSqrt(1, 1))

  // Prepare the pool address data to be written to the .env file
  let addresses = [
    `USDT_USDC_500=${usdtUsdc500}`
  ]
  const data = '\n' + addresses.join('\n') // Join the addresses with newlines

  // Promisify the fs.appendFile function to use async/await
  const writeFile = promisify(fs.appendFile);
  const filePath = '.env'; // Path to the .env file

  // Append the pool address data to the .env file
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