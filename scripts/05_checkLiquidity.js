/*
  npx hardhat run --network zircuit scripts/05_checkLiquidity.js

  This script retrieves and logs the pool data (tickSpacing, fee, liquidity, sqrtPriceX96, and tick)
  for the deployed USDT/USDC pool.
*/

require('dotenv').config() // Load environment variables from the .env file
USDT_USDC_500 = process.env.USDT_USDC_500 // Load the USDT/USDC pool address from the .env file

const { Contract } = require("ethers") // Import the Contract class from ethers.js
const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json") // Import the UniswapV3Pool contract artifact

// Function to get pool data from the UniswapV3Pool contract
async function getPoolData(poolContract) {
  // Get the tickSpacing, fee, liquidity, and slot0 (sqrtPriceX96 and tick) data from the pool contract
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  return {
    tickSpacing: tickSpacing, // The spacing between consecutive ticks
    fee: fee, // The fee tier of the pool
    liquidity: liquidity.toString(), // The total liquidity in the pool
    sqrtPriceX96: slot0[0], // The current sqrt price of the pool
    tick: slot0[1], // The current tick of the pool
  }
}

async function main() {
  const provider = ethers.provider // Get the default provider

  // Create an instance of the UniswapV3Pool contract for the deployed USDT/USDC pool
  const poolContract = new Contract(USDT_USDC_500, UniswapV3Pool.abi, provider)

  // Get the pool data from the UniswapV3Pool contract
  const poolData = await getPoolData(poolContract)
  console.log('poolData', poolData) // Log the pool data to the console
}


main()
  .then(() => process.exit(0)) // Exit with success
  .catch((error) => {
    console.error(error); // Log any errors
    process.exit(1); // Exit with failure
  });