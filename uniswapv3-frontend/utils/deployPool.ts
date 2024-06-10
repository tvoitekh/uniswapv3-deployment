import { ethers, Contract, BigNumber, Signer } from "ethers"; // Import the ethers library
import bn from "bignumber.js";
import UniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"; // Import the UniswapV3Factory contract ABI
import NonFungiblePositionManager from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"; // Import the NonfungiblePositionManager contract ABI
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 }); // Configure bignumber.js settings

const POSITION_MANAGER_ADDRESS = "0xec7e3FBebC673E05e667b5d39455585083DA9b7A";
const FACTORY_ADDRESS = "0xCd0A15Af740acE905cD22FA87b443AA2ecFeCD4d";
const NET_URL = "https://zircuit1.p2pify.com";
const provider = new ethers.providers.JsonRpcProvider(NET_URL);

// Function to encode the sqrt price for the pool
function encodePriceSqrt(reserve1: number, reserve0: number) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}
// Create instances of the NonfungiblePositionManager and UniswapV3Factory contracts
const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  NonFungiblePositionManager.abi,
  provider
);

const factory = new Contract(FACTORY_ADDRESS, UniswapV3Factory.abi, provider);

async function deployPool(
  token0Address: string,
  token1Address: string,
  fee: number,
  price: BigNumber,
  signer: Signer
) {
  // Call the createAndInitializePoolIfNecessary function to deploy the pool
  await nonfungiblePositionManager
    .connect(signer)
    .createAndInitializePoolIfNecessary(
      token0Address,
      token1Address,
      fee,
      price,
      {
        gasLimit: 5000000,
      }
    );
  // Get the address of the deployed pool
  const poolAddress = await factory
    .connect(signer)
    .getPool(token0Address, token1Address, fee);
  return poolAddress;
}

export default async function (
  token0Address: string,
  token1Address: string,
  fee: number,
  signer: Signer
) {
  // Deploy a new USDT/USDC pool with a fee tier of 500 and an initial price of 1:1
  const poolAddress = await deployPool(
    token0Address,
    token1Address,
    fee,
    encodePriceSqrt(1, 1),
    signer
  );

  // Prepare the pool address data to be written to the .env file

  // Append the pool address data to the .env file
  return poolAddress;
}
