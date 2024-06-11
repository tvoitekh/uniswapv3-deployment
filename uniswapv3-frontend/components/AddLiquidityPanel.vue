<script setup lang="ts">
import { ethers } from "ethers";
import getTokensContract from "../utils/getTokenContract";
import { getPoolAddress, getPool } from "../utils/getPoolData";
import {
  getAmount0AndLiquidity,
  getAmount1AndLiquidity,
} from "../utils/positionCalculation";
import deployPool from "../utils/deployPool";
import getPriceFromSqrtPriceX96 from "../utils/getPriceFromSqrtPriceX96";
import getTickFromPrice from "../utils/getTickFromPrice";
import addLiquidity from "../utils/addLiquidity";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

let fees = [
  { title: "0.01%", value: 100, tickSpacing: 1 },
  { title: "0.05%", value: 500, tickSpacing: 10 },
  { title: "0.3%", value: 3000, tickSpacing: 60 },
  { title: "1%", value: 10000, tickSpacing: 200 },
];
const user = useUserStore();
console.log(user.signer.instance, user.signerAddress);

let fromToken = ref("USDT");
let fromTokenAmount = ref(0);
let toToken = ref("");
let toTokenAmount = ref(0);
let liquidity = ref(0);
let poolAddress = ref(undefined);
let poolData = ref(undefined);
let price = ref(undefined);
let isLoadingPool = ref(false);
let fee = ref(500);
let priceUpper = ref(0);
let priceLower = ref(0);
let isLoading = ref(false);
let balances = ref([0, 0]);
const tokenList = ["USDT", "USDC", "WBTC"];
const tokenProps = {
  USDT: {
    name: "Tether",
    symbol: "USDT",
    decimals: 18,
    address: "0x0eD1B87Fd219a147dD77CE581D9e28e1Cbe39Da6",
  },
  USDC: {
    name: "UsdCoin",
    symbol: "USDC",
    decimals: 18,
    address: "0x5166328E361c038AaFA691caC1303cde569e02FA",
  },
  WBTC: {
    name: "WrappedBitcoin",
    symbol: "WBTC",
    decimals: 18,
    address: "0xdC4390ee59b9969F98B4783C69b70688568F3b68",
  },
};

watch([fromToken, toToken, fee], async ([from, to, fee]) => {
  isLoadingPool.value = true;
  const token0Address = tokenProps[from].address;
  const token1Address = tokenProps[to].address;
  const fromTokenContract = getTokensContract(token0Address);
  const toTokenContract = getTokensContract(token1Address);

  let fromBalance = await fromTokenContract.balanceOf(user.signerAddress);
  let toBalance = await toTokenContract.balanceOf(user.signerAddress);

  fromBalance = ethers.utils.formatUnits(
    fromBalance,
    tokenProps[from].decimals
  );
  toBalance = ethers.utils.formatUnits(toBalance, tokenProps[to].decimals);

  balances.value = [fromBalance, toBalance];
  poolAddress.value = await getPoolAddress(token0Address, token1Address, fee);
  try {
    poolData.value = await getPool(token0Address, token1Address, fee);
  } catch (e) {
    console.log(e);
    isLoadingPool.value = false;
  }
  price.value = getPriceFromSqrtPriceX96(poolData.value.sqrtRatioX96);
  priceLower.value = price.value * 0.9;
  priceUpper.value = price.value * 1.1;
  isLoadingPool.value = false;
});

watch(fromTokenAmount, async (amount) => {
  [toTokenAmount.value, liquidity.value] = await getAmount0AndLiquidity(
    amount,
    price.value,
    priceLower.value,
    priceUpper.value
  );
});

watch(toTokenAmount, async (amount) => {
  [fromTokenAmount.value, liquidity.value] = await getAmount1AndLiquidity(
    amount,
    price.value,
    priceLower.value,
    priceUpper.value
  );
});

const isNumberRule = (v) => {
  return !isNaN(parseFloat(v));
};
const isDifferentToken = (v) => {
  return v !== fromToken.value;
};

const createPool = async () => {
  await deployPool(
    tokenProps[fromToken.value].address,
    tokenProps[toToken.value].address,
    fee.value,
    user.signer.instance
  );
};

const handleAddLiquidity = async () => {
  console.log(user.signer);
  const tickSpacing = fees.find((f) => f.value === fee.value).tickSpacing;
  await addLiquidity(
    user.signer.instance,
    tokenProps[fromToken.value],
    tokenProps[toToken.value],
    fromTokenAmount.value,
    toTokenAmount.value,
    liquidity.value,
    priceLower.value,
    priceUpper.value,
    tickSpacing,
    poolData.value
  );
};
</script>
<template>
  <v-container>
    <v-card id="main">
      <v-card-title>
        <h2>Add Liquidity</h2>
      </v-card-title>
      <v-card-text id="token-pair">
        <v-select
          class="token"
          label="Token"
          v-model="fromToken"
          :items="tokenList"
          variant="solo"
        ></v-select>

        <v-select
          class="token"
          label="Token"
          v-model="toToken"
          :items="tokenList"
          variant="solo"
          :rules="[isDifferentToken]"
        ></v-select>
      </v-card-text>

      <v-card-text>
        <v-select
          class="fee-tier"
          label="Fee"
          v-model="fee"
          :items="fees"
          variant="solo"
        ></v-select>
      </v-card-text>

      <v-card-text>
        <div v-if="isLoadingPool">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <div v-else-if="poolAddress == NULL_ADDRESS">
          <span>No such pool </span>
          <v-btn
            color="primary"
            variant="flat"
            class="white--text"
            @click="createPool"
            >Create one</v-btn
          >
        </div>
        <div v-else-if="poolAddress">
          <span>Pool address: {{ poolAddress }}. Nice Pool (⁎⁍̴̛ᴗ⁍̴̛⁎)</span>
        </div>
      </v-card-text>

      <v-card-text>
        <h3>Current Price: {{ price }}</h3>
        <v-container>
          <v-text-field
            v-model="priceLower"
            label="Lower price"
            variant="solo"
            placeholder="0"
            :rules="[isNumberRule]"
            :hint="`${toToken} per ${fromToken}`"
            persistent-hint
          ></v-text-field>
        </v-container>
        <v-container>
          <v-text-field
            v-model="priceUpper"
            label="Upper price"
            variant="solo"
            placeholder="0"
            :rules="[isNumberRule]"
            :hint="`${toToken} per ${fromToken}`"
            persistent-hint
          ></v-text-field>
        </v-container>
      </v-card-text>

      <v-card-text>
        <h3>Deposit amount</h3>
        <v-container>
          <v-text-field
            v-model="fromTokenAmount"
            :label="fromToken"
            variant="solo"
            placeholder="0"
            :rules="[isNumberRule]"
          ></v-text-field>
        </v-container>
        <span>Balance: {{ balances[0] }}</span>
        <v-container>
          <v-text-field
            v-model="toTokenAmount"
            :label="toToken"
            variant="solo"
            placeholder="0"
            :rules="[isNumberRule]"
          ></v-text-field>
        </v-container>
        <span>Balance: {{ balances[1] }}</span>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="!user.signerAddress"
          @click="user.connect()"
          color="primary"
          variant="tonal"
          >Connect Your Wallet!!!</v-btn
        >
        <v-btn
          v-else
          color="primary"
          variant="flat"
          class="white--text"
          @click="handleAddLiquidity"
        >
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style lang="scss" scoped>
.v-card-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.v-card#main {
  padding: 20px;
  border-radius: 20px;
  margin-top: 40px;
  width: 50%;
}
.v-select {
  &.fee-tier {
    width: 100%;
  }
  &.token {
    max-width: 45%;
  }
}

.v-card#menu {
  padding: 20px;
  border-radius: 20px;
}

.v-text-field {
  border-radius: 40px !important;
}

.v-card-text {
  &#token-pair {
    display: flex;
    justify-content: space-between;
  }
}

.v-container {
  padding: 10px;
  display: flex;
  justify-content: center;
}

.v-btn {
  text-transform: none;
}
.white--text {
  color: white !important;
}
</style>
