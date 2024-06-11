import { ethers, Contract, Signer } from "ethers";
import TETHER_JSON from "../../artifacts/contracts/Tether.sol/Tether.json";

const runtimeConfig = useRuntimeConfig();

const NET_URL = "https://zircuit1.p2pify.com";
const ERC20_ABI = TETHER_JSON.abi;
const web3Provider = new ethers.providers.JsonRpcProvider(NET_URL);

export default function (tokenAddress: string, signer?: Signer): Contract {
  if (signer === undefined) {
    signer = web3Provider as any;
  }
  console.log("signer", signer, web3Provider);
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
}
