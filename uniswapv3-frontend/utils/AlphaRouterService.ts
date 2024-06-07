import { AlphaRouter } from "@uniswap/smart-order-router";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { ethers, BigNumber, Signer } from "ethers";
import JSBI from "jsbi";
import TETHER_JSON from "../../artifacts/contracts/Tether.sol/Tether.json";

const ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS;
const ERC20_ABI = TETHER_JSON.abi;
const NET_URL = process.env.NET_URL;
const CHAIN_ID = parseInt(process.env.CHAIN_ID as string);

const web3Provider = new ethers.providers.JsonRpcProvider(NET_URL);
const router = new AlphaRouter({
  chainId: CHAIN_ID,
  provider: web3Provider,
});

interface TokenProps {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
}

export default class AlphaRouterService {
  tokenIn: Token;
  tokenOut: Token;
  tokenInContract: ethers.Contract;
  tokenOutContract: ethers.Contract;
  constructor(tokenIn: TokenProps, tokenOut: TokenProps) {
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
    this.tokenInContract = new ethers.Contract(
      tokenIn.address,
      ERC20_ABI,
      web3Provider
    );
    this.tokenOutContract = new ethers.Contract(
      tokenOut.address,
      ERC20_ABI,
      web3Provider
    );
  }

  async getPrice(
    inputAmount: number,
    slippage: number,
    deadline: number,
    walletAddress: string
  ) {
    const percentSlippage = new Percent(slippage, 100);
    const wei = ethers.utils.parseUnits(
      inputAmount.toString(),
      this.tokenIn.decimals
    );
    const currencyAmount = CurrencyAmount.fromRawAmount(
      this.tokenIn,
      JSBI.BigInt(wei)
    );
    const route = await router.route(
      currencyAmount,
      this.tokenOut,
      TradeType.EXACT_INPUT,
      {
        type: 1,
        recipient: walletAddress,
        slippageTolerance: percentSlippage,
        deadline: deadline,
      }
    );
    const transcation = {
      data: route!.methodParameters!.calldata,
      to: ROUTER_ADDRESS,
      value: BigNumber.from(route!.methodParameters!.value),
      from: walletAddress,
      gasPrice: BigNumber.from(route!.gasPriceWei),
      gasLimit: ethers.utils.hexlify(1000000),
    };
    const quoteAmountOut = route!.quote.toFixed(6);
    const ratio = (parseInt(quoteAmountOut) / inputAmount).toFixed(3);
    return { transcation, quoteAmountOut, ratio };
  }

  async swap(transcation: any, signer: Signer) {
    const approvalAmount = ethers.utils.parseUnits("10", 18).toString();
    await this.tokenInContract
      .connect(signer)
      .approve(ROUTER_ADDRESS, approvalAmount);
    signer.sendTransaction(transcation);
  }
}
