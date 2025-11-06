"use client";

import TopUpModal from "@/components/billing/TopUpModal";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

export default function BillingPage() {
  const { userId } = useUser();
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 text-white bg-[#050505] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Billing and Credits</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#191919] hover:bg-[#232323] border border-[#2b2b2b] rounded-lg"
        >
          + Top Up
        </button>
      </div>

      <div>Billing History Table</div>
      {/* <BillingHistoryTable records={records} /> */}

      {showModal && <TopUpModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
