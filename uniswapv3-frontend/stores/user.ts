import { defineStore } from "pinia";
import { ethers } from "ethers";

export const useUserStore = defineStore("user", {
  state: () => ({
    provider: shallowReactive({
      instance: undefined as ethers.providers.Web3Provider | undefined,
    }),
    signer: shallowReactive({
      instance: undefined as ethers.Signer | undefined,
    }),
    signerAddress: undefined as string | undefined,
    counter: 0,
  }),
  actions: {
    async connect() {
      try {
        this.counter += 1;
        console.log(this.counter);
        console.log("Initializing provider...");
        this.provider.instance = await new ethers.providers.Web3Provider(
          (window as any).ethereum
        );

        console.log("Requesting accounts...");
        await this.provider.instance.send("eth_requestAccounts", []);
        console.log("Getting signer...");
        this.signer.instance = this.provider.instance.getSigner();
        console.log("Getting signer address...");
        this.signerAddress = await this.signer.instance.getAddress();
        console.log("Connected:", this.signerAddress);
      } catch (error) {
        console.error("Error during connection:", error);
      }
    },
  },
});
