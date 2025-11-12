// Unreal Client Service for Client-side fetch
// e.g to support controller that only works in the browser.
// For example: AbortController

import { unrealApiUrl } from "@/utils/config";
import { ChatCompletionResponse } from "@/utils/types";

// Request a chat completion from Unreal API
export async function getChatCompletionClient(
  token: string,
  model: string,
  message: string,
  signal?: AbortSignal // Optional signal to support cancellation
): Promise<ChatCompletionResponse> {
  console.debug("Unreal API Url", unrealApiUrl);

  try {
    const response = await fetch(`${unrealApiUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "DeCenterAIApp/1.0",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: `unreal::${model}`,
        messages: [{ role: "user", content: message }],
        stream: false,
      }),
      signal, // Attach AbortController signal here
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = data.error || "Failed to get chat completion";
      if (data.price) {
        errorMessage += `: Insufficient funds, requires at least ${data.price} credits`;
      }
      console.error("Error getting chat completion", data);
      throw new Error(errorMessage);
    }

    return data as ChatCompletionResponse;
  } catch (error) {
    // Detect if the error came from an aborted request
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("Chat completion request was aborted");
      throw new Error("Chat completion request canceled");
    }
    console.error("Error getting chat completion:", error);
    throw new Error(
      error instanceof Error ? error.message : "Chat completion failed"
    );
  }
}
