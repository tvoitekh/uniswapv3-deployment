<script lang="ts" setup>
definePageMeta({
  layout: "navbar",
});

useHead({
  title: "AddLiquidty",
});
</script>

<template><AddLiquidityPanel /></template>

<style lang="scss">
.custom-color-box {
  color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-secondary));
  padding: 20px;
  border-radius: 4px;
}
</style>
