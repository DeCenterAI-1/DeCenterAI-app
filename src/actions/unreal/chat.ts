"use server";

import { unrealClient } from "@/lib/unrealClient";
import { ChatCompletionResponse } from "@/utils/types";

// Request a chat completion from Unreal API
export const getChatCompletion = async (
  token: string,
  model: string,
  message: string
): Promise<ChatCompletionResponse> => {
  try {
    console.debug("Request chat completion", token, model, message);

    const res = await unrealClient.post<ChatCompletionResponse>(
      "/v1/chat/completions",
      {
        model: `unreal::${model}`,
        messages: [{ role: "user", content: message }],
        stream: false,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 25000, // chat completion may take longer
      }
    );

    console.debug("Chat completion response data", res.data);

    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error getting chat completion:", error);
    if (error.data?.price) {
      throw new Error(
        `${error.data.error}: Requires at least ${error.data.price} credits`
      );
    }

    throw new Error(error.message || "Chat completion failed");
  }
};
