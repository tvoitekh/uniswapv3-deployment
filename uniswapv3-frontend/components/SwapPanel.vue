<script setup>
import { mdiCog } from "@mdi/js";
import getTokenContract from "../utils/getTokenContract";
import { ethers } from "ethers";

const user = useUserStore();
const swap = useSwapStore();
let fees = [
  { title: "0.01%", value: 100, tickSpacing: 1 },
  { title: "0.05%", value: 500, tickSpacing: 10 },
  { title: "0.3%", value: 3000, tickSpacing: 60 },
  { title: "1%", value: 10000, tickSpacing: 200 },
];

let fromToken = ref("USDT");
let fromTokenBalance = ref(0);
let toToken = ref("");
let toTokenBalance = ref(0);
let slippageTolerance = ref(0.5);
let fee = ref(500);
let price = ref(0);
let isLoading = ref(false);
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

const isNumberRule = (v) => {
  return !isNaN(parseFloat(v));
};
const isDifferentToken = (v) => {
  return v !== fromToken.value;
};

watch([fromToken, toToken, fee], async ([from, to, fee]) => {
  if (from && to) {
    const fromTokenProps = tokenProps[from];
    const toTokenProps = tokenProps[to];

    const fromTokenContract = getTokenContract(fromTokenProps.address);
    const toTokenContract = getTokenContract(toTokenProps.address);

    fromTokenBalance.value = await fromTokenContract.balanceOf(
      user.signerAddress
    );
    fromTokenBalance.value = ethers.utils.formatUnits(
      fromTokenBalance.value,
      fromTokenProps.decimals
    );
    toTokenBalance.value = await toTokenContract.balanceOf(user.signerAddress);
    toTokenBalance.value = ethers.utils.formatUnits(
      toTokenBalance.value,
      toTokenProps.decimals
    );
  }
});
</script>
<template>
  <v-container>
    <v-card id="main">
      <v-card-title>
        <h2>Swap</h2>
        <v-menu location="start" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn :icon="mdiCog" v-bind="props"></v-btn>
          </template>

          <v-card id="menu">
            <v-card-title>Transaction Settings</v-card-title>
            <v-card-text>Slippage Tolerance</v-card-text>
            <v-text-field
              :ref="slippageTolerance"
              v-model="slippageTolerance"
              suffix="%"
              variant="outlined"
              :rules="[isNumberRule]"
            ></v-text-field>
            <v-card-text>Deadline</v-card-text>
            <v-text-field
              :ref="swap.deadline"
              v-model="swap.deadline"
              variant="outlined"
              suffix="minutes"
              :rules="[isNumberRule]"
            ></v-text-field>
          </v-card>
        </v-menu>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-text-field
            label="Sell"
            variant="solo"
            placeholder="0"
            v-model="swap.inputAmount"
            :rules="[isNumberRule]"
          ></v-text-field>
          <v-select
            label="Token"
            v-model="fromToken"
            :items="tokenList"
            variant="solo"
          ></v-select>
        </v-container>
        <span>Balance: {{ fromTokenBalance }}</span>
        <v-container>
          <v-text-field
            label="Buy"
            variant="solo"
            placeholder="0"
            v-model="swap.outputAmount"
            :rules="[isNumberRule]"
          ></v-text-field>
          <v-select
            label="Token"
            v-model="toToken"
            :items="tokenList"
            variant="solo"
            :rules="[isDifferentToken]"
          ></v-select>
        </v-container>
        <span>Balance: {{ toTokenBalance }}</span>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="!user.signerAddress"
          @click="user.connect()"
          color="primary"
          variant="tonal"
          >Connect Your Wallet!!!</v-btn
        >
        <v-btn v-else color="primary" variant="tonal">Swap</v-btn>
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
  max-width: 30%;
  margin-left: 20px;
}

.v-card#menu {
  padding: 20px;
  border-radius: 20px;
}

.v-text-field {
  border-radius: 40px !important;
}

.v-container {
  padding: 10px;
  display: flex;
  justify-content: center;
}
.v-btn {
  text-transform: none;
}
</style>
