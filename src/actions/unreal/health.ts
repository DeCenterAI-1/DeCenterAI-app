"use server";

import { unrealClient } from "@/lib/unrealClient";

export interface NetworkHealth {
  status: string;
  nearai?: { healthy: boolean };
  "github-models"?: { healthy: boolean };
}

/**
 * Fetch Unreal Network health status
 * @returns NetworkHealth response or error state
 */
export async function getNetworkHealth(): Promise<{
  success: boolean;
  data?: NetworkHealth;
  message?: string;
}> {
  try {
    const res = await unrealClient.get("/v1/health");

    console.debug(
      "Network Health response",
      res.data,
      res.status,
      res.statusText
    );

    // axios treats non-2xx as rejected, so here res.status is 2xx
    return { success: true, data: res.data as NetworkHealth };
  } catch (error) {
    console.error("Error Get Network Health:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch network health",
    };
  }
}
