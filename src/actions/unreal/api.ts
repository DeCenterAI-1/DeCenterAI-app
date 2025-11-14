"use server";

import { supabase } from "@/lib/supabase";
import { getUserByWallet } from "../supabase/users";
import { GetAllApiKeysResponse, UnrealApiKeyResponse } from "@/utils/types";
import { unrealClient } from "@/lib/unrealClient";

// Helper functions
async function getUserAndToken(wallet: string) {
  const userRes = await getUserByWallet(wallet);
  if (!userRes.success) throw new Error(userRes.message);

  const user = userRes.data;
  if (!user.unreal_token) throw new Error("No Unreal session token found");

  return { user, unrealToken: user.unreal_token };
}

// Generate new Unreal API Key
export const createUnrealApiKey = async (
  userWallet: string,
  apiName: string
) => {
  try {
    console.log(
      "Creating Unreal API key for wallet",
      userWallet,
      "with name",
      apiName
    );

    if (!userWallet || !apiName) {
      throw new Error("User wallet and API name are required");
    }

    // Get user and unreal token from Supabase by wallet
    const { user, unrealToken } = await getUserAndToken(userWallet);

    // Call POST /v1/keys
    const res = await unrealClient.post<UnrealApiKeyResponse>(
      "/v1/keys",
      { name: apiName },
      {
        headers: {
          Authorization: `Bearer ${unrealToken}`,
        },
      }
    );

    // Parse the successful response
    const data: UnrealApiKeyResponse = res.data;

    // Save API key information in supabase api_keys table
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .insert([
        {
          user: user.id, // user.id is the foreign key referencing user_profiles.id
          provider: "unreal",
          api_key: data.key,
          api_hash: data.hash,
          api_name: data.state.name,
          payment_token: data.state.paymentToken,
          calls: data.state.calls,
          initial_calls: data.state.calls,
        },
      ])
      .select("*");

    if (apiKeyError) {
      throw new Error(
        `Failed to save API key to Supabase: ${apiKeyError.message}`
      );
    }

    if (!apiKeyData || !apiKeyData.length) {
      throw new Error("No API key data returned after insertion");
    }

    return {
      success: true,
      data: {
        apiKey: apiKeyData[0],
        unrealResponse: data,
      },
    };
  } catch (error) {
    console.error("Error creating Unreal API key:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the API key.",
    };
  }
};

// Get all user's API keys from Unreal API
export const getAllUnrealApiKeys = async (userWallet: string) => {
  try {
    console.log("Getting all Unreal API keys for wallet", userWallet);

    if (!userWallet) {
      throw new Error("User wallet is required");
    }

    // Get user and unreal token from Supabase by wallet
    const { unrealToken } = await getUserAndToken(userWallet);

    // Call GET /v1/keys
    const res = await unrealClient.get<GetAllApiKeysResponse>("/v1/keys", {
      headers: { Authorization: `Bearer ${unrealToken}` },
    });

    // Parse the successful response
    const data: GetAllApiKeysResponse = res.data;

    // Return the array of keys
    return {
      success: true,
      data: data.keys,
    };
  } catch (error) {
    console.error("Error getting all Unreal API keys:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while retrieving API keys.",
    };
  }
};

// Delete an user own Unreal API key by the key
export const deleteApiKey = async (key: string, userWallet: string) => {
  try {
    console.log("Deleting Unreal API key", key, "for wallet", userWallet);

    if (!key || !userWallet) {
      throw new Error("API key and user wallet are required");
    }

    // Get user and unreal token from Supabase by wallet
    const { user, unrealToken } = await getUserAndToken(userWallet);

    // Call DELETE /v1/keys/{key}
    const res = await unrealClient.delete(`/v1/keys/${key}`, {
      headers: {
        Authorization: `Bearer ${unrealToken}`,
      },
    });

    // Parse the successful response
    const data = res.data;
    if (!data.deleted) {
      throw new Error("API key deletion was not confirmed by Unreal API");
    }

    // Delete the API key from Supabase api_keys table
    const { error: deleteError } = await supabase
      .from("api_keys")
      .delete()
      .eq("api_key", key)
      .eq("user", user.id);

    if (deleteError) {
      throw new Error(
        `Failed to delete API key from Supabase: ${deleteError.message}`
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting Unreal API key:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the API key.",
    };
  }
};
