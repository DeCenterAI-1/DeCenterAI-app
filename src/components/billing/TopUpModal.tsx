"use client";

import { useState } from "react";
import { CheckoutWidget } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { activeChain, getChainConfigById } from "@/utils/chains";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-toastify";
import { arbitrum, base, polygon, bsc, ethereum } from "thirdweb/chains";

interface TopUpModalProps {
  onClose: () => void;
}

// Define supported chains and tokens
const supportedChains = [
  { id: ethereum.id, name: "Ethereum", chain: ethereum },
  { id: polygon.id, name: "Polygon", chain: polygon },
  { id: bsc.id, name: "BNB Smart Chain", chain: bsc },
  { id: base.id, name: "Base", chain: base },
  { id: arbitrum.id, name: "Arbitrum One", chain: arbitrum },
];

const supportedTokens = {
  [ethereum.id]: [
    {
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum USDC
    },
  ],
  [polygon.id]: [
    {
      symbol: "USDC",
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon USDC
    },
  ],
  [bsc.id]: [
    {
      symbol: "USDC",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC USDC
    },
  ],
  [base.id]: [
    {
      symbol: "USDC",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
    },
  ],
  [arbitrum.id]: [
    {
      symbol: "USDC",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum USDC
    },
  ],
};

const sellerWallet = process.env
  .NEXT_PUBLIC_TOPUP_SELLER_WALLET! as `0x${string}`;

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const { userId } = useUser();
  const [credits, setCredits] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedChain, setSelectedChain] = useState(polygon);
  const [selectedToken, setSelectedToken] = useState(
    supportedTokens[polygon.id][0]
  );

  const chainConfig = getChainConfigById(activeChain.id);
  const unrealToken = chainConfig?.custom?.tokens?.UnrealToken;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSuccess = async (tx: any) => {
    setLoading(true);
    try {
      const amountUsd = credits / 100; // $1 = 100 credits

      await fetch("/api/billing/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amountUsd,
          credits,
          txHash: tx.transactionHash,
          receiptUrl: tx.receiptUrl ?? null,
        }),
      });

      toast.success(`Top-up successful! Added ${credits} credits.`);
      onClose();
    } catch (error) {
      toast.error("Failed to record billing transaction.");
      console.error("Error record billing transaction", error);
    } finally {
      setLoading(false);
    }
  };

  // When chain changes, update token list & reset selected token
  const handleChainChange = (chainId: number) => {
    const chain = supportedChains.find((c) => c.id === chainId);
    if (chain) {
      setSelectedChain(chain.chain);
      setSelectedToken(supportedTokens[chainId][0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#191919] p-6 rounded-2xl w-[380px] text-white border border-[#2b2b2b]">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Top Up Credits
        </h2>

        <label className="block mb-2 text-sm text-gray-400">Credits</label>
        <input
          type="number"
          min={10}
          step={10}
          value={credits}
          onChange={(e) => setCredits(Math.max(10, Number(e.target.value)))}
          className="w-full p-2 rounded-md bg-[#101010] border border-[#2b2b2b] mb-4 text-white"
        />
        <p className="text-sm text-gray-500 mb-4 text-center">
          {credits} credits = ${(credits / 100).toFixed(2)}
        </p>

        {/* Chain & Token selectors */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="block mb-1 text-sm text-gray-400">Chain</label>
            <select
              value={selectedChain.id}
              onChange={(e) => handleChainChange(Number(e.target.value))}
              className="w-full p-2 rounded-md bg-[#101010] border border-[#2b2b2b] text-white"
            >
              {supportedChains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block mb-1 text-sm text-gray-400">Token</label>
            <select
              value={selectedToken.address}
              onChange={(e) =>
                setSelectedToken(
                  supportedTokens[selectedChain.id].find(
                    (t) => t.address === e.target.value
                  )!
                )
              }
              className="w-full p-2 rounded-md bg-[#101010] border border-[#2b2b2b] text-white"
            >
              {supportedTokens[selectedChain.id].map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkout Widget */}
        <div className="border-t border-[#2b2b2b] pt-4">
          <CheckoutWidget
            client={client}
            chain={selectedChain}
            theme="dark"
            currency={"USD"}
            amount={(credits / 100).toString()}
            tokenAddress={selectedToken.address as `0x${string}`}
            seller={sellerWallet}
            onSuccess={(data) => handleSuccess(data)}
            onError={(error, quote) => {
              console.error("Payment not success", error);
              console.info(quote);
              toast.error("Payment failed or canceled");
            }}
            onCancel={(quote) => {
              console.info("User cancel payment", quote);
              toast.warn("Topup canceled");
            }}
          />
        </div>

        <button
          disabled={loading}
          onClick={onClose}
          className="mt-4 w-full bg-[#2b2b2b] hover:bg-[#353535] py-2 rounded-lg text-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
