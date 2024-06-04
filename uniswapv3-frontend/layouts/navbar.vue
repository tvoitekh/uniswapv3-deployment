<script setup>
const user = useUserStore();
</script>

<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>
        <v-app-bar-nav-icon @click="$router.push('/')" sele>
          <v-img src="../public/dummiswap.png"></v-img>
        </v-app-bar-nav-icon>
        <v-btn @click="$router.push('/swap')">Swap</v-btn>
        <v-btn @click="$router.push('/pool')">Pool</v-btn>
        <v-btn @click="$router.push('/vote')">Vote</v-btn>
        <v-btn @click="$router.push('/charts')">Charts</v-btn>
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

.v-btn {
  text-transform: none;
  :active {
    background-color: white;
  }
}

@keyframes wave {
  0%,
  100% {
    transform: initial;
  }
  50% {
    transform: translateY(-4px);
  }
}
.v-img {
  animation: wave 0.8s infinite;
  width: 2rem;
  height: 2rem;
}
</style>
