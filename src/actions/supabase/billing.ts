"use server";

import { supabase } from "@/lib/supabase";
import { BillingRecordType, PurchaseData } from "@/utils/types";

// Fetch all billing records for a user
export const fetchBillingHistory = async (
  userId: number
): Promise<BillingRecordType[]> => {
  try {
    const { data, error } = await supabase
      .from("billing_history")
      .select("*")
      .eq("user", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Fetch billing history error", error);
    throw new Error("Failed to fetch billing history");
  }
};

// Save a new billing record after top-up success
export const saveBillingRecord = async (
  userId: number,
  credits: number,
  amountUsd: number,
  txHash?: string,
  receiptUrl?: string,
  purchaseData?: PurchaseData,
  status: "completed" | "pending" | "failed" = "completed"
): Promise<void> => {
  try {
    const { error } = await supabase.from("billing_history").insert({
      user: userId,
      credits,
      amount_usd: amountUsd,
      tx_hash: txHash ?? null,
      receipt_url: receiptUrl ?? null,
      purchase_data: purchaseData ?? null,
      status,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error saving billing record", error);
    throw new Error("Failed to save billing record");
  }
};

// Delete all records (e.g., for testing)
export const deleteBillingHistory = async (userId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from("billing_history")
      .delete()
      .eq("user", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting billing history", error);
    throw new Error("Failed to delete billing records");
  }
};
