"use server";

import { unrealClient } from "@/lib/unrealClient";

export interface UnrealModel {
  id: string;
  owned_by?: string;
  modalities?: string[];
  capabilities?: Record<string, boolean>;
  aliases?: string[];
}

// Fetch available Unreal models
export async function getUnrealModels() {
  try {
    const res = await unrealClient.get("/v1/models");

    // Default empty array safeguard in case the API shape changes
    const rawData = res.data?.data ?? [];
    const models = Array.isArray(rawData) ? rawData : [];

    // Filter only models that support chat
    const chatModels = models.filter((m) => m.capabilities?.chat === true);

    return { success: true, data: chatModels };
  } catch (error) {
    console.error("Error fetching Unreal models:", error);
    return { success: false, data: [] as UnrealModel[], error };
  }
}
