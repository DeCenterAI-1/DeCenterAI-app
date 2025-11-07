import {
  activeChainConfig,
  amoyTestnet,
  amoyTestnetConfig,
  somniaShanonTestnet,
  somniaShanonTestnetConfig,
  titanAITestnet,
  titanAITestnetConfig,
  torusMainnet,
  torusMainnetConfig,
} from "@/utils/chains";

// Get payment token address by Chain
export function getPaymentTokenAddress(chainId: number): string {
  switch (chainId) {
    case torusMainnet.id:
      return torusMainnetConfig.custom.tokens.UnrealToken.address;

    case titanAITestnet.id:
      return titanAITestnetConfig.custom.tokens.UnrealToken.address;

    case amoyTestnet.id:
      return amoyTestnetConfig.custom.tokens.UnrealToken.address;

    case somniaShanonTestnet.id:
      return somniaShanonTestnetConfig.custom.tokens.UnrealToken.address;

    default:
      return "";
  }
}

// Get payment token address of the Active Chain
export function getActiveChainPaymentTokenAddress(): string {
  return activeChainConfig.custom.tokens.UnrealToken.address;
}
