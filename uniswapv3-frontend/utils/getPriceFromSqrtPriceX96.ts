import JSBI from "jsbi";
// 計算價格
export default function getPriceFromSqrtPriceX96(sqrtPriceX96: JSBI): number {
  const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

  // 將 sqrtPriceX96 轉換為價格
  const priceX96 = JSBI.divide(JSBI.multiply(sqrtPriceX96, sqrtPriceX96), Q96);

  // 轉換為數字格式
  return Number(priceX96.toString()) / 2 ** 96;
}
