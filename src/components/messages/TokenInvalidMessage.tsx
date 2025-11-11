"use client";

import { refreshUnrealSessionToken } from "@/services/unrealAuth.service";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Account } from "thirdweb/wallets";
import Spinner from "../ui/icons/Spinner";

interface TokenInvalidMessageProps {
  account: Account | undefined;
  chainId: number | undefined;
  onRefreshSuccess?: () => void; // Callback to notify parent on successful refresh
}

export default function TokenInvalidMessage({
  account,
  chainId,
  onRefreshSuccess,
}: TokenInvalidMessageProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [triedRefreshToken, setTriedRefreshToken] = useState(false); // Whether already tried to refresh session token

  async function refreshSessionToken() {
    if (!account || !chainId) {
      toast.error("Wallet not connected");
      return { success: false };
    }

    setIsRefreshing(true);
    try {
      const refreshRes = await refreshUnrealSessionToken(account, chainId);

      if (refreshRes.success) {
        toast.success("Session token refreshed successfully");
      }

      if (onRefreshSuccess) onRefreshSuccess(); // Trigger callback on success

      return { success: true };
    } catch (error) {
      console.error("Error refresh session token", error);
      toast.error(
        error instanceof Error ? error.message : "Refresh session token failed"
      );
      return { success: false };
    } finally {
      setIsRefreshing(false);
    }
  }

  // Try refresh access token once on mount
  useEffect(() => {
    if (!triedRefreshToken && account && chainId) {
      setTriedRefreshToken(true);
      refreshSessionToken();
    }
  }, [account, chainId]);

  return (
    <div className="w-full p-4 bg-red-600 text-white text-center rounded-[20px] mb-4">
      {isRefreshing ? (
        <div className="flex justify-center items-center gap-2">
          <Spinner />
          Refreshing ...
        </div>
      ) : (
        <div>
          You do not have a valid Unreal API session token. Click{" "}
          <button
            onClick={refreshSessionToken}
            disabled={isRefreshing}
            className="font-semibold underline cursor-pointer text-gray-600 hover:text-gray-400 transition-colors bg-neutral-200 p-1.5 rounded-sm"
          >
            Refresh session token
          </button>{" "}
          or contact us.
        </div>
      )}
    </div>
  );
}
