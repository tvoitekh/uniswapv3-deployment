import { Contract, ethers, Signer } from "ethers";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import TETHER_JSON from "../../artifacts/contracts/Tether.sol/Tether.json";
import IUniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import IUniswapV3Router from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json";

const ERC20_ABI = TETHER_JSON.abi;
const POOL_ABI = IUniswapV3Pool.abi;
const ROUTER_ABI = IUniswapV3Router.abi;
const NET_URL = process.env.NET_URL;
const CHAIN_ID = parseInt(process.env.CHAIN_ID ?? "48899"); // Defaulting to chain ID 48899 (Zircuit)
const ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS ?? "";

const web3Provider = new ethers.providers.JsonRpcProvider(NET_URL);

interface TokenProps {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
}

export default class AlphaRouterService {
  tokenIn: Token;
  tokenOut: Token;
  tokenInContract: Contract;
  tokenOutContract: Contract;
  poolContract: Contract;
  routerContract: Contract;

  constructor(tokenIn: TokenProps, tokenOut: TokenProps, poolAddress: string) {
    this.tokenIn = new Token(
      CHAIN_ID,
      tokenIn.address,
      tokenIn.decimals,
      tokenIn.symbol,
      tokenIn.name
    );
    this.tokenOut = new Token(
      CHAIN_ID,
      tokenOut.address,
      tokenOut.decimals,
      tokenOut.symbol,
      tokenOut.name
    );
    this.tokenInContract = new Contract(tokenIn.address, ERC20_ABI, web3Provider);
    this.tokenOutContract = new Contract(tokenOut.address, ERC20_ABI, web3Provider);
    this.poolContract = new Contract(poolAddress, POOL_ABI, web3Provider);
    this.routerContract = new Contract(ROUTER_ADDRESS, ROUTER_ABI, web3Provider);
  }

  async getPrice(inputAmount: number, slippage: number): Promise<number> {
    const slot0 = await this.poolContract.slot0();
    const sqrtPriceX96 = slot0[0];

    const price = (sqrtPriceX96 ** 2) / (2 ** 192);
    const outputAmount = inputAmount * price * (1 - slippage / 100);

    return outputAmount;
  }

  async swap(inputAmount: number, minOutputAmount: number, signer: Signer) {
    const approvalAmount = ethers.utils.parseUnits("10", 18).toString();
    await this.tokenInContract.connect(signer).approve(ROUTER_ADDRESS, approvalAmount);

    const params = {
      tokenIn: this.tokenIn.address,
      tokenOut: this.tokenOut.address,
      fee: 3000,
      recipient: await signer.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
      amountIn: ethers.utils.parseUnits(inputAmount.toString(), this.tokenIn.decimals),
      amountOutMinimum: ethers.utils.parseUnits(minOutputAmount.toString(), this.tokenOut.decimals),
      sqrtPriceLimitX96: 0, // no price limit
    };

    const txResponse = await this.routerContract.connect(signer).exactInputSingle(params);
    await txResponse.wait();
  }
}
