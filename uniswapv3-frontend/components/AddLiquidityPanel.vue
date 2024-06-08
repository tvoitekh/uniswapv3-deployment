<script setup lang="ts">
import { ethers } from "ethers";
import getTokensContract from "../utils/getTokenContract";
const user = useUserStore();

let fromToken = ref("USDT");
let toToken = ref("");
let price = ref(0);
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

watch([fromToken, toToken], async ([from, to]) => {
  console.log(from, to);
  const fromTokenContract = getTokensContract(tokenProps[from].address);
  const toTokenContract = getTokensContract(tokenProps[to].address);

  let fromBalance = await fromTokenContract.balanceOf(user.signerAddress);
  let toBalance = await toTokenContract.balanceOf(user.signerAddress);

  fromBalance = ethers.utils.formatUnits(
    fromBalance,
    tokenProps[from].decimals
  );
  toBalance = ethers.utils.formatUnits(toBalance, tokenProps[to].decimals);
  console.log(typeof fromBalance, typeof toBalance);

  balances.value = [fromBalance, toBalance];
});

const isNumberRule = (v) => {
  return !isNaN(parseFloat(v));
};
const isDifferentToken = (v) => {
  return v !== fromToken.value;
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
          label="Token"
          v-model="fromToken"
          :items="tokenList"
          variant="solo"
        ></v-select>

        <v-select
          label="Token"
          v-model="toToken"
          :items="tokenList"
          variant="solo"
          :rules="[isDifferentToken]"
        ></v-select>
      </v-card-text>

      <v-card-text>
        <v-container>
          <v-text-field
            label="Sell"
            variant="solo"
            placeholder="0"
            :rules="[isNumberRule]"
          ></v-text-field>
        </v-container>
        <span>Balance: {{ balances[0] }}</span>
        <v-container>
          <v-text-field
            label="Buy"
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
        <v-btn v-else color="primary" variant="flat" class="white--text">
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
  max-width: 45%;
}

.v-card#menu {
  padding: 20px;
  border-radius: 20px;
}

.v-text-field {
  border-radius: 40px !important;
}

.v-card-text {
  #token-pair {
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
