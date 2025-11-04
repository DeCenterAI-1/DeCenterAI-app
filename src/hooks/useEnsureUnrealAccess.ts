"use client";

import { useEffect, useState } from "react";
import { signAndRegisterAccount } from "@/services/unrealAuth.service";
import { getUserByWallet } from "@/actions/supabase/users";
import { useActiveAccount } from "thirdweb/react";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-toastify";
import { activeChain } from "@/utils/chains";
import { getPaymentTokenAddress } from "@/services/payment-token.service";
import { fetchTokenBalance } from "@/services/thirdweb.service";
import { client } from "@/lib/thirdweb";

export function useEnsureUnrealAccess() {
  const account = useActiveAccount();
  const { wallet } = useUser();
  const [isEnsuring, setIsEnsuring] = useState(false);
  const [hasEnsured, setHasEnsured] = useState(false);

  useEffect(() => {
    const ensureAccess = async () => {
      if (!wallet || !account || isEnsuring || hasEnsured) return;

      setIsEnsuring(true);
      try {
        // Get user info from Supabase
        const userRes = await getUserByWallet(wallet);
        if (!userRes.success || !userRes.data) {
          console.warn("Failed to fetch user by wallet");
          return;
        }

        const unrealToken = userRes.data.unreal_token;

        if (unrealToken) {
          console.debug("Unreal access already registered.");
          return;
        }

        // Check wallet for Unreal tokens before registering
        const unrealTokenAddress = getPaymentTokenAddress(activeChain.id);
        const balance = await fetchTokenBalance(
          wallet,
          activeChain,
          client,
          unrealTokenAddress
        );
        const hasBalance = balance && Number(balance.displayValue) > 0;

        if (!hasBalance) {
          console.info(
            "Wallet has no Unreal tokens yet — delaying Unreal registration"
          );
          return; // will retry later automatically
        }

        // Register Unreal access if wallet has tokens
        console.info("No Unreal access yet, but wallet funded. Registering...");
        const res = await signAndRegisterAccount(account, activeChain.id);
        if (res.success) {
          toast.success("Unreal API access registered successfully!");
        } else {
          toast.error("Unreal API access registeration failed ");
          console.warn("Unreal token registration failed:", res.error);
        }
      } catch (error) {
        console.error("Error ensuring Unreal access:", error);
      } finally {
        setIsEnsuring(false);
        setHasEnsured(true);
      }
    };

    ensureAccess();
  }, [wallet, account]);

  return { isEnsuring, hasEnsured };
}
