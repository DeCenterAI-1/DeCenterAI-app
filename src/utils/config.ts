// Utility: remove trailing slashes safely
function normalizeUrl(url: string | undefined): string {
  if (!url) return "";
  return url.replace(/\/+$/, ""); // remove one or more trailing slashes
}

export const UNREAL_REG_PAYLOAD_CONFIG = {
  UNREAL_OPENAI_ADDRESS: process.env.NEXT_PUBLIC_UNREAL_OPENAI_ADDRESS!,
  CALLS_INITIAL: 50, // TODO: Number(process.env.NEXT_PUBLIC_UNREAL_CALLS_INITIAL) || 50,
  WELCOME_TOKENS: 1000, // TODO: Number(process.env.NEXT_PUBLIC_UNREAL_WELCOME_TOKENS) || 1000,
  EXPIRY_SECONDS: Number(process.env.NEXT_PUBLIC_UNREAL_EXPIRY_SECONDS) || 3600,
  TREASURY_PRIVATE_KEY: process.env.NEXT_PUBLIC_TREASURY_PRIVATE_KEY!,
  MAX_API_KEYS: Number(process.env.NEXT_PUBLIC_MAX_API_KEYS) || 10, // Maximum number of API keys per user
};

export const unrealApiUrl =
  normalizeUrl(process.env.NEXT_PUBLIC_UNREAL_API_URL) ||
  "https://openai.ideomind.org";

export const appUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);
