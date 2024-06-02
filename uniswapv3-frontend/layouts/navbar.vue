<script setup>
const user = useUserStore();
console.log(user);
</script>

<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title
        >Uniswap
        <v-btn>Swap</v-btn>
        <v-btn>Pool</v-btn>
        <v-btn>Vote</v-btn>
        <v-btn>Charts</v-btn>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn
        rounded
        v-if="!user.signerAddress"
        class="connect-btn"
        @click="user.connect()"
        >Connect Wallet</v-btn
      >
      <v-btn rounded v-else class="connect-btn">{{
        `${user.signerAddress.substring(0, 6)}...
      ${user.signerAddress.substring(user.signerAddress.length - 4)}
      `
      }}</v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <slot></slot>
      </v-container>
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>
.connect-btn {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

button {
  text-transform: none;
}
</style>
