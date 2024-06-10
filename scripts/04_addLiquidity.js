/*
  npx hardhat run --network zircuit scripts/04_addLiquidity.js

  This script adds liquidity to the deployed USDT/USDC pool and mints
  a new Uniswap V3 position for the second signer.
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
USDT_USDC_500 = process.env.USDT_USDC_500 // Address of the deployed USDT/USDC pool

// Import contract artifacts
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers") // Import the Contract class from ethers.js
const { Token } = require('@uniswap/sdk-core') // Import the Token class from the Uniswap SDK
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk') // Import classes from the Uniswap V3 SDK

// Function to get pool data from the UniswapV3Pool contract
async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}

async function main() {
  const [_owner, signer2] = await ethers.getSigners(); // Get the second signer from the provider
  const provider = ethers.provider // Get the default provider

  // Create instances of the Tether and UsdCoin contracts
  const usdtContract = new Contract(TETHER_ADDRESS, artifacts.Usdt.abi, provider)
  const usdcContract = new Contract(USDC_ADDRESS, artifacts.Usdc.abi, provider)

  // Approve the NonfungiblePositionManager contract to spend Tether and UsdCoin tokens
  await usdtContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))
  await usdcContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'))

  // Create an instance of the UniswapV3Pool contract for the deployed USDT/USDC pool
  const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)

  // Get the pool data from the UniswapV3Pool contract
  const poolData = await getPoolData(poolContract)

  // Create instances of the Token class for Tether and UsdCoin
  const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
  const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

  // Create an instance of the Pool class from the Uniswap V3 SDK
  const pool = new Pool(
    UsdtToken,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  )

  // Create an instance of the Position class from the Uniswap V3 SDK
  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther('1'), // Set the desired liquidity amount
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2, // Set the lower tick
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2, // Set the upper tick
  })

  // Get the desired amounts of Tether and UsdCoin to mint the position
  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts

  // Prepare the parameters for the mint function
  params = {
    token0: TETHER_ADDRESS, // Address of the first token (Tether)
    token1: USDC_ADDRESS, // Address of the second token (UsdCoin)
    fee: poolData.fee, // Fee tier of the pool
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2, // Lower tick
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2, // Upper tick
    amount0Desired: amount0Desired.toString(), // Desired amount of Tether
    amount1Desired: amount1Desired.toString(), // Desired amount of UsdCoin
    amount0Min: 0, // Minimum amount of Tether (set to 0 for this example)
    amount1Min: 0, // Minimum amount of UsdCoin (set to 0 for this example)
    recipient: signer2.address, // Address to receive the minted NFT position
    deadline: Math.floor(Date.now() / 1000) + (60 * 10) // Deadline for the transaction (10 minutes from now)
  }

  // Create an instance of the NonfungiblePositionManager contract
  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )

  // Call the mint function to add liquidity and mint a new position
  const tx = await nonfungiblePositionManager.connect(signer2).mint(
    params,
    { gasLimit: '1000000' } // Set a higher gas limit for the transaction
  )
  await tx.wait() // Wait for the transaction to be mined
}

main()
  .then(() => process.exit(0)) // Exit with success
  .catch((error) => {
    console.error(error); // Log any errors
    process.exit(1); // Exit with failure
  });