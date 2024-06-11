import { Pool } from "@uniswap/v3-sdk";
import { getPool } from "./getPoolData";
import { ethers, Signer } from "ethers";
import UniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"; // Import the UniswapV3Factory contract ABI
import UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"; // Import the UniswapV3Po
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";

const QUOTER_CONTRACT_ADDRESS = "";

export default async function (
  token0Props: any,
  token1Props: any,
  amount: number,
  fee: number,
  signer: Signer
) {
  const pool: Pool = await getPool(
    token0Props.address,
    token1Props.address,
    fee
  );
  console.log(pool);
  const quoterContract = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    signer
  );
  const [token0, token1, liquidity, slot0] = await getPoolData(
    token0Props.address,
    token1Props.address,
    fee,
    signer
  );
  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    token0,
    token1,
    fee,
    ethers.utils.parseUnits(amount.toString(), token0Props.decimals),
    0
  );

  return quotedAmountOut;
}

async function getPoolData(
  token0Address: string,
  token1Address: string,
  fee: number,
  Signer: Signer
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
    signer
  );
  const [token0, token1, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);
  return [token0, token1, liquidity, slot0];
}
