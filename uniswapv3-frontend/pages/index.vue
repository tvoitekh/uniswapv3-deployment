<script lang="ts" setup>
definePageMeta({
  layout: "navbar",
});

useHead({
  title: "HomePage",
});
</script>

<template>
  <v-container>
    <v-img src="public/dummiswap.png"></v-img>
    <h1 class="custom-color-box">Welcom to Dummiswap!</h1>
  </v-container>
</template>

<style lang="scss" scoped>
.custom-color-box {
  color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-secondary));
  padding: 20px;
  border-radius: 4px;
}

@keyframes wave {
  0%,
  100% {
    transform: initial;
  }
  50% {
    transform: translateY(-30px);
  }
}
.v-img {
  width: 454px;
  height: 462px;
  margin-bottom: 40px;
  animation: wave 1s infinite;
}

.v-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
