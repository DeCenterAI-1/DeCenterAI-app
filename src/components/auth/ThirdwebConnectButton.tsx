import { client } from "@/lib/thirdweb";
import { activeChain, activeChainConfig } from "@/utils/chains";
import React from "react";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";

export function ThirdwebConnectButton() {
  const wallets = [
    inAppWallet({
      auth: {
        options: ["google", "email"],
      },
    }),
  ];

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      connectButton={{ label: "Sign-In" }}
      connectModal={{ showThirdwebBranding: true, size: "wide" }}
      theme={"dark"}
      chain={activeChain}
      supportedTokens={{
        [activeChain.id]: [
          {
            address: activeChainConfig.custom.tokens.UnrealToken.address,
            name: activeChainConfig.custom.tokens.UnrealToken.name,
            symbol: activeChainConfig.custom.tokens.UnrealToken.symbol,
          },
        ],
      }}
    />
  );
}
