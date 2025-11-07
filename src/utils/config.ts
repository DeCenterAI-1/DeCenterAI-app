// Utility: remove trailing slashes safely
function normalizeUrl(url: string | undefined): string {
  if (!url) return "";
  return url.replace(/\/+$/, ""); // remove one or more trailing slashes
}

export const UNREAL_REG_PAYLOAD_CONFIG = {
  UNREAL_OPENAI_ADDRESS: process.env.NEXT_PUBLIC_UNREAL_OPENAI_ADDRESS!,
  CALLS_INITIAL: Number(process.env.NEXT_PUBLIC_UNREAL_CALLS_INITIAL) || 50,
  EXPIRY_SECONDS: Number(process.env.NEXT_PUBLIC_UNREAL_EXPIRY_SECONDS) || 3600,
};

export const unrealApiUrl = normalizeUrl(process.env.UNREAL_API_URL);

export const appUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);
