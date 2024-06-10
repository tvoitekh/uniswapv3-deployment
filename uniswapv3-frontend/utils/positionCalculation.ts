export function getAmount1AndLiquidity(
  amount: number,
  currentPrice: number,
  priceLower: number,
  priceUpper: number
) {
  if (currentPrice <= priceLower || currentPrice >= priceUpper) {
    return 0;
  }

  const liquidity =
    (amount * Math.sqrt(priceUpper) * Math.sqrt(currentPrice)) /
    (Math.sqrt(priceUpper) - Math.sqrt(currentPrice));

  return [
    liquidity * (Math.sqrt(currentPrice) - Math.sqrt(priceLower)),
    liquidity,
  ];
}

export function getAmount0AndLiquidity(
  amount: number,
  currentPrice: number,
  priceLower: number,
  priceUpper: number
) {
  if (currentPrice <= priceLower || currentPrice >= priceUpper) {
    return 0;
  }

  const liquidity = amount / (Math.sqrt(currentPrice) - Math.sqrt(priceLower));

  return [
    (liquidity * (Math.sqrt(priceUpper) - Math.sqrt(currentPrice))) /
      (Math.sqrt(priceUpper) * Math.sqrt(currentPrice)),
    liquidity,
  ];
}
