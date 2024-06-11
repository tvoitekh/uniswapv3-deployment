import getTokenContract from "./getTokenContract";
import { ethers, Signer, Contract } from "ethers";
import { Pool, Position } from "@uniswap/v3-sdk";
import getTickFromPrice from "./getTickFromPrice";
import NonfungiblePositionManager from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import TETHER_JSON from "../../artifacts/contracts/Tether.sol/Tether.json";
const ERC20_ABI = TETHER_JSON.abi;
const POSITION_MANAGER_ADDRESS = "0xec7e3FBebC673E05e667b5d39455585083DA9b7A";

export default async function addLiquidity(
  signer: Signer,
  token0Props: any,
  token1Props: any,
  fromTokenAmount: number,
  toTokenAmount: number,
  liquidity: number,
  priceLower: number,
  priceUpper: number,
  tickSpacing: number,
  pool: Pool
) {
  const fromTokenContract = new ethers.Contract(
    token0Props.address,
    ERC20_ABI,
    signer
  );
  const toTokenContract = getTokenContract(token1Props.address, signer);

  const fromTokenAmountInWei = ethers.utils.parseUnits(
    fromTokenAmount.toString(),
    token0Props.decimals
  );
  const toTokenAmountInWei = ethers.utils.parseUnits(
    toTokenAmount.toString(),
    token1Props.decimals
  );

  console.log("Approving token0 for spending...", fromTokenAmountInWei);
  try {
    await fromTokenContract
      .connect(signer)
      .approve(POSITION_MANAGER_ADDRESS, fromTokenAmountInWei);
  } catch (e) {
    console.log(e);
  }
  console.log("Approving token1 for spending...");
  try {
    await toTokenContract
      .connect(signer)
      .approve(POSITION_MANAGER_ADDRESS, toTokenAmountInWei);
  } catch (e) {
    console.log(e);
  }

  const tickLower = getTickFromPrice(priceLower, tickSpacing);
  const tickUpper = getTickFromPrice(priceUpper, tickSpacing);

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther(liquidity.toString()) as any, // Set the desired liquidity amount
    tickLower: tickLower,
    tickUpper: tickUpper,
  });

  // Get the desired amounts of Tether and UsdCoin to mint the position
  const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts;

  // Prepare the parameters for the mint function
  const params = {
    token0: token0Props.address, // Address of the first token (Tether)
    token1: token0Props.address, // Address of the second token (UsdCoin)
    fee: pool.fee, // Fee tier of the pool
    tickLower: tickLower,
    tickUpper: tickUpper,
    amount0Desired: amount0Desired.toString(), // Desired amount of Tether
    amount1Desired: amount1Desired.toString(), // Desired amount of UsdCoin
    amount0Min: 0, // Minimum amount of Tether (set to 0 for this example)
    amount1Min: 0, // Minimum amount of UsdCoin (set to 0 for this example)
    recipient: signer.getAddress(), // Address to receive the minted NFT position
    deadline: Math.floor(Date.now() / 1000) + 60 * 10, // Deadline for the transaction (10 minutes from now)
  };

  // Create an instance of the NonfungiblePositionManager contract
  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    NonfungiblePositionManager.abi,
    signer
  );
  console.log("Minting position...");

  // Call the mint function to add liquidity and mint a new position
  const tx = await nonfungiblePositionManager.connect(signer).mint(
    params,
    { gasLimit: "1000000" } // Set a higher gas limit for the transaction
  );
  await tx.wait();
}
