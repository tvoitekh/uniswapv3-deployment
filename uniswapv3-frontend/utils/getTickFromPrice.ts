import JSBI from "jsbi";
import { nearestUsableTick, TickMath } from "@uniswap/v3-sdk";

// 假設價格範圍
const priceLower = 0.9;
const priceUpper = 1.1;

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

// 計算 sqrtPriceX96
function encodeSqrtRatioX96(price: number): JSBI {
  const sqrtPrice = Math.sqrt(price);
  return JSBI.divide(
    JSBI.multiply(JSBI.BigInt(Math.floor(sqrtPrice * Math.pow(2, 96))), Q96),
    Q96
  );
}
export default function getTickFromPrice(
  price: number,
  tickSpacing: number
): number {
  const tick = TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(price));
  return nearestUsableTick(tick, tickSpacing);
}
