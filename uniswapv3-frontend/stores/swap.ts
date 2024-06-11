import { defineStore } from "pinia";
import { ethers, BigNumber } from "ethers";

export const useSwapStore = defineStore("swap", {
  state: () => ({
    ratio: undefined as BigNumber | undefined,
    deadline: 10,
    showModal: false,
    inputAmount: undefined as BigNumber | undefined,
    outputAmount: undefined as BigNumber | undefined,
    transaction: undefined as ethers.ContractTransaction | undefined,
    inputTokenContract: undefined as ethers.Contract | undefined,
    outputTokenContract: undefined as ethers.Contract | undefined,
    inputTokenBalance: undefined as BigNumber | undefined,
    outputTokenBalance: undefined as BigNumber | undefined,
  }),
});
