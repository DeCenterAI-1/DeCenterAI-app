// Axios instance for Unreal API
// Axios should only be used in server actions
import { createAxiosInstance } from "./axios";
import { unrealApiUrl } from "@/utils/config";

export const unrealClient = createAxiosInstance(unrealApiUrl);

// Add default headers required by Unreal API
unrealClient.defaults.headers.common["User-Agent"] = "DeCenterAIApp/1.0";

// Ensure requests to Unreal explicitly don't get cached by proxies
unrealClient.defaults.headers.common["Cache-Control"] = "no-store";
unrealClient.defaults.headers.common["Pragma"] = "no-cache";
