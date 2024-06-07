<script setup>
import { mdiCog } from "@mdi/js";
import AlphaRouterService from "../utils/AlphaRouterService";

const user = useUserStore();
const swap = useSwapStore();

let fromToken = ref("USDT");
let toToken = ref("");
let slippageTolerance = ref(0.5);
let alphaRouterService = ref(undefined);
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

watch([fromToken, toToken], async ([from, to]) => {
  if (from && to) {
    const fromTokenProps = tokenProps[from];
    const toTokenProps = tokenProps[to];
    isLoading.value = true;
    alphaRouterService = new AlphaRouterService(fromTokenProps, toTokenProps);
    price = alphaRouterService
      .getPrice(
        swap.inputAmount,
        slippageTolerance,
        Math.floor(Date.now() / 1000) + swap.deadline * 60,
        user.signerAddress
      )
      .then((data) => {
        swap.transaction = data.transaction;
        swap.outputAmount = data.outputAmount;
        swap.ratio = data.ratio;
        isLoading.value = false;
      });
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
