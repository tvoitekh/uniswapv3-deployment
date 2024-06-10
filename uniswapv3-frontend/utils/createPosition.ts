import { ethers, Signer, Contract } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import UniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"; // Import the UniswapV3Factory contract ABI
import UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"; // Import the UniswapV3Pool contract ABI
import NonFungiblePositionManager from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"; // Import the NonfungiblePositionManager contract ABI

const POSITION_MANAGER_ADDRESS = "0xec7e3FBebC673E05e667b5d39455585083DA9b7A";
const FACTORY_ADDRESS = "0xCd0A15Af740acE905cD22FA87b443AA2ecFeCD4d";
const NET_URL = "https://zircuit1.p2pify.com";
const provider = new ethers.providers.JsonRpcProvider(NET_URL);

const factory = new Contract(FACTORY_ADDRESS, UniswapV3Factory.abi, provider);

async function getPoolData(poolContract: Contract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

export default async function (
  signer: Signer,
  token0Address: string,
  token1Address: string,
  fee: number,
  tickLower: number,
  tickUpper: number,
  amount0Min: ethers.BigNumber,
  amount1Min: ethers.BigNumber,
  deadline: ethers.BigNumber
) {
  // Create instances of the Tether and UsdCoin contracts

  const token0Contract = getTokenContract(token0Address);
  const token1Contract = getTokenContract(token1Address);

  // Approve the NonfungiblePositionManager contract to spend Tether and UsdCoin tokens
  await token0Contract
    .connect(signer)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000"));
  await token1Contract
    .connect(signer)
    .approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther("1000"));

  const poolAddress = await factory
    .connect(signer)
    .getPool(token0Address, token1Address, fee);

  // Create an instance of the UniswapV3Pool contract for the deployed USDT/USDC pool
  const poolContract = new Contract(poolAddress, UniswapV3Pool.abi, provider);

  // Get the pool data from the UniswapV3Pool contract
  const poolData = await getPoolData(poolContract);

  // Create instances of the Token class for Tether and UsdCoin
  const token0 = new Token(
    48899,
    token0Address,
    18,
    await token0Contract.symbol(),
    await token0Contract.name()
  );
  const token1 = new Token(
    48899,
    token1Address,
    18,
    await token1Contract.symbol(),
    await token1Contract.name()
  );

  // Create an instance of the Pool class from the Uniswap V3 SDK
  const pool = new Pool(
    token0,
    token1,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  // Create an instance of the Position class from the Uniswap V3 SDK
  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther("1"), // Set the desired liquidity amount
    tickLower: nearestUsableTick(tickLower, poolData.tickSpacing),
    tickUpper: nearestUsableTick(tickUpper, poolData.tickSpacing),
  });

  // Get the desired amounts of Tether and UsdCoin to mint the position
  const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts;

  // Prepare the parameters for the mint function
  const params = {
    token0: token0Address, // Address of the first token (Tether)
    token1: token1Address, // Address of the second token (UsdCoin)
    fee: poolData.fee, // Fee tier of the pool
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2, // Lower tick
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2, // Upper tick
    amount0Desired: amount0Desired.toString(), // Desired amount of Tether
    amount1Desired: amount1Desired.toString(), // Desired amount of UsdCoin
    amount0Min: 0, // Minimum amount of Tether (set to 0 for this example)
    amount1Min: 0, // Minimum amount of UsdCoin (set to 0 for this example)
    recipient: signer.getAddress(), // Address to receive the minted NFT position
    deadline: deadline, // Deadline for the transaction (10 minutes from now)
  };

  // Create an instance of the NonfungiblePositionManager contract
  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );

  // Call the mint function to add liquidity and mint a new position
  const tx = await nonfungiblePositionManager.connect(signer2).mint(
    params,
    { gasLimit: "1000000" } // Set a higher gas limit for the transaction
  );
  await tx.wait();
}
