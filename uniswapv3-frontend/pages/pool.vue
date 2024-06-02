<script lang="ts" setup>
definePageMeta({
  layout: "navbar",
});

useHead({
  title: "Pool",
});
</script>

<template>
  <h1 class="custom-color-box">Yay! You're on the pool!</h1>
</template>

<style lang="scss">
.custom-color-box {
  color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-secondary));
  padding: 20px;
  border-radius: 4px;
}
</style>
