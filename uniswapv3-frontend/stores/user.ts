// stores/counter.js
import { defineStore } from "pinia";
import { ethers } from "ethers";

export const useUserStore = defineStore("user", {
  state: () => ({
    provider: undefined as ethers.providers.Web3Provider | undefined,
    signer: undefined as ethers.Signer | undefined,
    signerAddress: undefined as string | undefined,
  }),
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    async connect() {
      this.provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );

      this.provider.send("eth_requestAccounts", []);
      this.signer = this.provider.getSigner();
      this.signerAddress = await this.signer.getAddress();
    },
  },
});
