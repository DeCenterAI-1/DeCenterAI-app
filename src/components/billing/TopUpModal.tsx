"use client";

import { useState } from "react";
import { BuyWidget, CheckoutWidget } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { activeChain, getChainConfigById } from "@/utils/chains";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-toastify";
import { defineChain, polygon } from "thirdweb/chains";

interface TopUpModalProps {
  onClose: () => void;
}

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const { userId } = useUser();
  const [credits, setCredits] = useState(100);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      toast.error("Failed to record billing transaction.");
      console.error(err);
    } finally {
      setLoading(false);
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
          min={100}
          step={100}
          value={credits}
          onChange={(e) => setCredits(Math.max(100, Number(e.target.value)))}
          className="w-full p-2 rounded-md bg-[#101010] border border-[#2b2b2b] mb-4 text-white"
        />
        <p className="text-sm text-gray-500 mb-4 text-center">
          {credits} credits = ${(credits / 100).toFixed(2)}
        </p>

        <div className="border-t border-[#2b2b2b] pt-4">
          <CheckoutWidget
            client={client}
            chain={polygon}
            theme="dark"
            currency={"USD"}
            amount={(credits / 100).toString()}
            tokenAddress={"0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"} // USDC on Polygon
            seller={"0x0000000000000000000000000000000000000000"}
            onSuccess={handleSuccess}
            onError={(e) => {
              console.error(e);
              toast.error("Payment failed or canceled.");
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
