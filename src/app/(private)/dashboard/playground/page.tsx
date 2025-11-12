"use client";

import { getUserByWallet } from "@/actions/supabase/users";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { fallbackModels } from "@/utils/models";
import TokenInvalidMessage from "@/components/messages/TokenInvalidMessage";
import { verifyUnrealSessionToken } from "@/actions/unreal/auth";
import Spinner from "@/components/ui/icons/Spinner";
import {
  deleteAllChatHistory,
  fetchChatHistory,
  saveChatMessage,
} from "@/actions/supabase/chat_history";
import { getApiKeysByUser } from "@/actions/supabase/api_keys";
import { BinIcon } from "@/components/ui/icons";
import { logirentBold } from "@/styles/fonts";
import { getUnrealModels } from "@/actions/unreal/models";
import IconStop from "@/components/ui/icons/IconStop";
import { getChatCompletionClient } from "@/services/unrealClient.service";

interface ChatMessage {
  id: number;
  user_message: string;
  ai_response: string;
  model: string;
  created_at: string;
}

interface ApiKey {
  id: number;
  api_name: string;
  api_key: string;
}

function extractModelName(modelPath: string): string {
  const match = modelPath.match(/models\/([^/]+)/);
  return match ? match[1] : "AI";
}

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [unrealToken, setUnrealToken] = useState<string | null>(null);
  const [models, setModels] = useState(fallbackModels);
  const [selectedModel, setSelectedModel] = useState(fallbackModels[0].id);
  const [loadingModels, setLoadingModels] = useState(true);
  const [isUnrealTokenValid, setIsUnrealTokenValid] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>("");
  const [loadingApiKeys, setLoadingApiKeys] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null); // Store AbortController
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userAccount = useActiveAccount();
  const userWallet = useActiveWallet();

  // --- Fetch user info and chat history ---
  const fetchUser = async () => {
    if (!userAccount?.address) return;

    try {
      const userRes = await getUserByWallet(userAccount.address);
      if (!userRes.success || !userRes.data)
        throw new Error("Failed to fetch user data");

      const { id, unreal_token } = userRes.data;
      setUserId(id);
      setUnrealToken(unreal_token);

      if (unreal_token) {
        const verifyRes = await verifyUnrealSessionToken(unreal_token);
        setIsUnrealTokenValid(verifyRes.success);
      } else setIsUnrealTokenValid(false);

      const history = await fetchChatHistory(id, 5);
      setMessages(history);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load user or chat history");
    }
  };

  // --- Fetch API Keys ---
  const fetchApiKeys = async (userId: number) => {
    setLoadingApiKeys(true);
    try {
      const apiKeysRes = await getApiKeysByUser(userId);
      if (!apiKeysRes.success) throw new Error("Failed to fetch API keys");

      const keys = apiKeysRes.data || [];
      setApiKeys(keys);
      setSelectedApiKey(keys[0]?.api_key || unrealToken || "");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch API keys");
    } finally {
      setLoadingApiKeys(false);
    }
  };

  // --- Send Message to Unreal API ---
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedApiKey) {
      toast.error("Invalid input or missing API key");
      return;
    }

    setLoading(true);
    const controller = new AbortController(); // Create a new controller
    abortControllerRef.current = controller;

    try {
      const data = await getChatCompletionClient(
        selectedApiKey,
        selectedModel,
        input,
        controller.signal // Pass the controler signal
      );
      const aiResponse = data.choices?.[0]?.message?.content || "No response";

      await saveChatMessage(
        userId!,
        input,
        aiResponse,
        data.model || selectedModel,
        data.object || "chat.completion"
      );

      setInput("");
      const history = await fetchChatHistory(userId!, 5);
      setMessages(history);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Chat completion request canceled"
      ) {
        toast.info(error.message);
      } else {
        console.error("Error Chat completion", error);
        toast.error(
          `Failed to get AI response. ${
            error instanceof Error && error.message
          }`
        );
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null; // cleanup
    }
  };

  // --- Stop Chat Completion ---
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  // --- Clear Chat History ---
  const handleClear = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await deleteAllChatHistory(userId);
      setMessages([]);
      toast.info("Chat history cleared");
    } catch (error) {
      console.error("Error clear chat history", error);
      toast.error("Failed to clear chat history");
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchUser();
  }, [userAccount]);

  useEffect(() => {
    if (userId) fetchApiKeys(userId);
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load models dynamically
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const res = await getUnrealModels();

        if (res.success && res.data.length > 0) {
          setModels(res.data);
          setSelectedModel(res.data[0].id); // first model as default
        } else {
          console.warn("Using fallback models");
          setModels(fallbackModels);
          setSelectedModel(fallbackModels[0].id);
        }
      } catch (error) {
        console.error("Error loading models, using fallback", error);
        // toast.warn("Failed to load models, using fallback");
        setModels(fallbackModels);
        setSelectedModel(fallbackModels[0].id);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  // --- UI ---
  return (
    <div className="flex-1 bg-[#050505] min-h-screen p-6 sm:p-8">
      {!isUnrealTokenValid && (
        <TokenInvalidMessage
          account={userAccount}
          chainId={userWallet?.getChain()?.id}
          onRefreshSuccess={fetchUser}
        />
      )}

      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[#050505] border border-[#232323] rounded-2xl">
          <h1
            className={`${logirentBold.className} text-[#F5F5F5] text-2xl font-normal`}
          >
            Playground
          </h1>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-[#C1C1C1] text-sm">Model:</label>
              {loadingModels ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span className="text-[#8F8F8F] text-sm">
                    Loading models...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="h-10 px-3 bg-[#191919] border border-[#232323] rounded-[14px] text-[#8F8F8F] text-sm focus:border-[#494949] outline-none"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[#C1C1C1] text-sm">API Key:</label>
              {loadingApiKeys ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span className="text-[#8F8F8F] text-sm">
                    Loading API keys...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedApiKey}
                  onChange={(e) => setSelectedApiKey(e.target.value)}
                  className="h-10 px-3 bg-[#191919] border border-[#232323] rounded-[14px] text-[#8F8F8F] text-sm focus:border-[#494949] outline-none max-w-[180px]"
                >
                  {apiKeys.length > 0 ? (
                    apiKeys.map((key) => (
                      <option key={key.id} value={key.api_key}>
                        {key.api_name}
                      </option>
                    ))
                  ) : (
                    <option value={unrealToken || ""}>Session Token</option>
                  )}
                </select>
              )}
            </div>

            <button
              onClick={handleClear}
              className="flex items-center gap-2 border border-[#232323] px-4 py-2 rounded-[14px] hover:bg-[#191919] transition"
            >
              <BinIcon />
              <span className="text-[#C1C1C1] text-sm">Clear</span>
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-[#191919] border border-[#232323] rounded-[20px] p-4 sm:p-6 h-[60vh] overflow-y-auto space-y-3">
          {messages.length === 0 && !loading && (
            <p className="text-center text-[#8F8F8F] text-sm mt-10">
              No messages yet. Start a new conversation below!
            </p>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className="p-3 bg-[#232323] rounded-[14px] text-[#F5F5F5] text-sm">
                <strong>User:</strong> {msg.user_message}
              </div>
              <div className="p-3 bg-[#2B2B2B] rounded-[14px] text-[#F5F5F5] text-sm">
                <strong>{extractModelName(msg.model)}:</strong>{" "}
                {msg.ai_response}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
          {loading && (
            <div className="flex justify-center my-4">
              <Spinner />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto"; // reset height
              e.target.style.height = `${e.target.scrollHeight}px`; // grow to fit content
            }}
            placeholder="Type your message..."
            rows={1}
            className="w-full resize-none overflow-hidden px-4 py-3 bg-[#191919] border border-[#232323] rounded-[14px] text-[#C1C1C1] text-sm outline-none focus:border-[#494949] min-h-[48px] max-h-[200px]"
          />
          <button
            onClick={loading ? handleStop : handleSendMessage}
            disabled={!input.trim()}
            className="h-12 px-6 bg-[#232323] rounded-[14px] text-[#F5F5F5] text-sm font-semibold hover:bg-[#2B2B2B] transition disabled:opacity-50 flex items-center justify-center sm:self-end"
          >
            {loading ? <IconStop /> : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
