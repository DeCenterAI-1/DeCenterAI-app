"use server";

import { unrealClient } from "@/lib/unrealClient";
import {
  UnrealRegisterResponse,
  UnrealVerifyTokenResponse,
} from "@/utils/types";

// Register with the Unreal API to obtain session token
export const registerUnrealApiAccess = async (
  messagePayload: string,
  walletAddress: string,
  signature: string,
  permitPayload?: string,
  permitSignature?: string
): Promise<UnrealRegisterResponse> => {
  try {
    // Prepare payload for Unreal AI API registration
    const payload = JSON.parse(messagePayload);

    // Build request body
    const body = {
      payload,
      signature,
      address: walletAddress,
      ...(permitPayload ? { permit: JSON.parse(permitPayload) } : {}),
      ...(permitSignature ? { permitSignature } : {}),
    };

    console.debug("Unreal registration payload", body);

    // Register to Unreal AI API
    const res = await unrealClient.post("/v1/auth/register", body, {
      timeout: 60000, // Registration may take longer
    });

    console.debug(
      "Unreal registration response",
      res.data,
      res.status,
      res.statusText
    );

    return {
      success: true,
      unrealToken: res.data.token,
    };
  } catch (error) {
    console.error("Error register Unreal API", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Verify the validity of Unreal API session token
export const verifyUnrealSessionToken = async (
  sessionToken: string
): Promise<UnrealVerifyTokenResponse> => {
  try {
    const res = await unrealClient.get("/v1/auth/verify", {
      params: { token: sessionToken },
    });

    console.debug(
      "Verify session token response",
      res.data,
      res.status,
      res.statusText
    );

    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error verifying Unreal session token:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Invalid token",
    };
  }
};
