<script setup>
import { mdiCog } from "@mdi/js";

const user = useUserStore();

const tokenList = ["USDT", "USDC", "WBTC"];

const isNumberRule = (v) => {
  return !isNaN(parseFloat(v));
};
const isDifferentToken = (v) => {
  return v !== fromToken.value;
};

let fromToken = ref("USDT");
let toToken = ref("");
let slippageTolerance = ref(0.5);
let deadline = ref(2);
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
              :ref="deadline"
              v-model="deadline"
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
