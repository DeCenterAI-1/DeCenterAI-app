"use client";

import { useUser } from "@/hooks/useUser";
import React from "react";

export default function DashboardPage() {
  const { email, wallet } = useUser();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Welcome back 👋</h2>
      <div className="bg-[#0D0D0D] border border-[#191919] rounded-xl p-4 sm:w-[50%]">
        <p className="text-neutral-400 break-all">Email: {email || "—"}</p>
        <p className="text-neutral-400 break-all">Wallet: {wallet || "—"}</p>
      </div>
    </div>
  );
}
