<script setup lang="ts">
const user = useUserStore();

const positions = ref([]);
</script>

<template>
  <v-container>
    <v-card id="main">
      <v-card-title>
        <h2>Pool</h2>
        <v-btn color="primary" class="white--text" variant="flat"
          >+ Add position</v-btn
        >
      </v-card-title>

      <v-card-text>
        <v-list v-if="positions">
          <v-list-item-group>
            <v-list-item v-for="position in positions" :key="position.id">
              <v-list-item-content>
                <v-list-item-title>
                  <span
                    >{{ position.token0.symbol }}/{{
                      position.token1.symbol
                    }}</span
                  >
                  <span>{{ position.liquidity }}</span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <h3 v-else>U don't have any positions, luv :(</h3>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="!user.signerAddress"
          @click="user.connect()"
          color="primary"
          variant="flat"
          class="white--text"
          id="connect-wallet"
          >Connect Your Wallet!!!</v-btn
        >
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
  width: 70%;
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
.v-card-text {
  display: flex;
  justify-content: center;
}

.v-card-actions {
  display: flex;
  justify-content: center;
}

.white--text {
  color: white !important;
}
</style>
