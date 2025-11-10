"use server";

import { unrealApiUrl } from "@/utils/config";

export interface UnrealModel {
  id: string;
  owned_by?: string;
  modalities?: string[];
  capabilities?: Record<string, boolean>;
  aliases?: string[];
}

interface UnrealModelsResponse {
  object: string;
  data: UnrealModel[];
}

// Fetch available Unreal models
export async function getUnrealModels() {
  try {
    const res = await fetch(`${unrealApiUrl}/v1/models`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        "Failed to fetch Unreal models:",
        res.status,
        await res.text()
      );
      throw new Error(`Unreal API returned ${res.status}`);
    }

    const data: UnrealModelsResponse = await res.json();

    // Default empty array safeguard in case the API shape changes
    const models = Array.isArray(data.data) ? data.data : [];

    // Filter only models that support chat
    const chatModels = models.filter((m) => m.capabilities?.chat === true);

    return { success: true, data: chatModels };
  } catch (error) {
    console.error("Error fetching Unreal models:", error);
    return { success: false, data: [] as UnrealModel[], error };
  }
}
