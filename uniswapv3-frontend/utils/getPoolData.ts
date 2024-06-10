import { ethers } from "ethers";
import {
  Pool,
  Position,
  TickMath,
  FullMath,
  nearestUsableTick,
} from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import UniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"; // Import the UniswapV3Factory contract ABI
import UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"; // Import the UniswapV3Pool contract ABI

// 定義 provider 和 factory 地址
const provider = new ethers.providers.JsonRpcProvider(
  "https://zircuit1.p2pify.com"
);
const factoryAddress = "0xCd0A15Af740acE905cD22FA87b443AA2ecFeCD4d";

// 創建一個函數來獲取池地址
export async function getPoolAddress(
  token0: string,
  token1: string,
  fee: number
) {
  const factoryContract = new ethers.Contract(
    factoryAddress,
    UniswapV3Factory.abi,
    provider
  );
  const poolAddress = await factoryContract.getPool(token0, token1, fee);
  return poolAddress;
}

// 創建一個函數來獲取池數據
export async function getPoolData(
  token0Address: string,
  token1Address: string,
  fee: number
) {
  const token0Contract = getTokenContract(token0Address);
  const token1Contract = getTokenContract(token1Address);

  const poolAddress = await getPoolAddress(token0Address, token1Address, fee);
  if (poolAddress === ethers.constants.AddressZero) {
    throw new Error("Pool does not exist");
  }
  const poolContract = new ethers.Contract(
    poolAddress,
    UniswapV3Pool.abi,
    provider
  );
  const [liquidity, sqrtPriceX96, tick, tickSpacing] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0().then((result: any) => result[0]),
    poolContract.slot0().then((result: any) => result[1]),
    poolContract.tickSpacing(),
  ]);

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

  const pool = new Pool(
    token0,
    token1,
    fee,
    sqrtPriceX96,
    liquidity,
    tick,
    tickSpacing
  );

  return pool;
}
