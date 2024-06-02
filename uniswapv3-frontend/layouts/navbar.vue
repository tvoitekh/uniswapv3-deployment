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

      <v-btn class="connect-btn">Connect Wallet</v-btn>
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
</style>
