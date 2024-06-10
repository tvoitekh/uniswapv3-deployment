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
async function getPoolData(
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

// 計算 amount1
function calculateAmount1(
  pool: Pool,
  amount0: ethers.BigNumber,
  tickLower: number,
  tickUpper: number
) {
  const position = new Position({
    pool,
    liquidity: Position.fromAmounts({
      pool,
      tickLower: nearestUsableTick(tickLower, pool.tickSpacing),
      tickUpper: nearestUsableTick(tickUpper, pool.tickSpacing),
      amount0: amount0.toString(), // 假設您有這個值
      amount1: "0", // 我們不直接指定 amount1
      useFullPrecision: true,
    }).liquidity,
    tickLower: nearestUsableTick(tickLower, pool.tickSpacing),
    tickUpper: nearestUsableTick(tickUpper, pool.tickSpacing),
  });

  return position.amount1.toString();
}

function calculateAmount0(
  pool: Pool,
  amount1: ethers.BigNumber,
  tickLower: number,
  tickUpper: number
) {
  const position = new Position({
    pool,
    liquidity: Position.fromAmounts({
      pool,
      tickLower: nearestUsableTick(tickLower, pool.tickSpacing),
      tickUpper: nearestUsableTick(tickUpper, pool.tickSpacing),
      amount0: "0", // 我們不直接指定 amount0
      amount1: amount1.toString(), // 假設您有這個值
      useFullPrecision: true,
    }).liquidity,
    tickLower: nearestUsableTick(tickLower, pool.tickSpacing),
    tickUpper: nearestUsableTick(tickUpper, pool.tickSpacing),
  });
  return position.amount0.toString();
}

// 主函數
export async function getAmount1ForLiquidity(
  token0: string,
  token1: string,
  fee: number,
  amount0: string,
  tickLower: number,
  tickUpper: number
) {
  const pool = await getPoolData(token0, token1, fee);
  const amount0Parsed = ethers.utils.parseEther(amount0); // 您希望添加的資本量
  const amount1 = calculateAmount1(pool, amount0Parsed, tickLower, tickUpper);
  return amount1;
}

export async function getAmount0ForLiquidity(
  token0: string,
  token1: string,
  fee: number,
  amount1: string,
  tickLower: number,
  tickUpper: number
) {
  const pool = await getPoolData(token0, token1, fee);
  const amount1Parsed = ethers.utils.parseEther(amount1); // 您希望添加的資本量
  const amount0 = calculateAmount0(pool, amount1Parsed, tickLower, tickUpper);
  return amount0;
}
