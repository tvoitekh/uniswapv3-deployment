import { defineStore } from "pinia";
import { ethers } from "ethers";

const network = {
  chainId: 48899, // Optimism's chain ID
  name: "zircuit",
  _defaultProvider: ethers.providers.getDefaultProvider(
    "https://zircuit1.p2pify.com"
  ),
};

export const useUserStore = defineStore("user", {
  state: () => ({
    provider: shallowReactive({
      instance: undefined as ethers.providers.Web3Provider | undefined,
    }),
    signer: shallowReactive({
      instance: undefined as ethers.Signer | undefined,
    }),
    signerAddress: undefined as string | undefined,
  }),
  actions: {
    async connect() {
      this.provider.instance = await new ethers.providers.Web3Provider(
        (window as any).ethereum,
        network as any
      );

      await this.provider.instance.send("eth_requestAccounts", []);
      this.signer.instance = this.provider.instance.getSigner();
      this.signerAddress = await this.signer.instance.getAddress();
    },
  },
});
