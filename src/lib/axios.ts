import axios, { AxiosInstance } from "axios";

export function createAxiosInstance(baseURL?: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 15_000, // reasonable default timeout (ms)
    headers: {
      "Content-Type": "application/json",
      // Do NOT set User-Agent globally here — set per provider client if needed
    },
    // validateStatus can be left as default (>=200 && <300) or customized
  });

  // Optional: response interceptor to normalize errors
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      // normalize axios/network error to a useful Error instance
      if (error.response) {
        // server returned a non-2xx
        const msg = `HTTP ${error.response.status}: ${JSON.stringify(
          error.response.data
        )}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = new Error(msg) as Error & { status?: number; data?: any };

        // attach some info for debugging
        e.status = error.response.status;
        e.data = error.response.data;

        return Promise.reject(e);
      }
      // network / timeout
      return Promise.reject(error);
    }
  );

  return instance;
}
