import { API_BASE_URL } from "../config";

export async function testBackendConnection(): Promise<{
  connected: boolean;
  baseUrl: string;
  error?: string;
  latency?: number;
}> {
  const startTime = Date.now();
  try {
    console.log(`[Network Test] Testing connection to ${API_BASE_URL}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (res.ok) {
      console.log(`[Network Test] Connected! Latency: ${latency}ms`);
      return { connected: true, baseUrl: API_BASE_URL, latency };
    } else {
      const error = `Server responded with status ${res.status}`;
      console.error(`[Network Test] ${error}`);
      return { connected: false, baseUrl: API_BASE_URL, error };
    }
  } catch (err: any) {
    const latency = Date.now() - startTime;
    let error = err.message;

    if (err.name === "AbortError") {
      error = `Timeout after 5s - backend not responding or network is slow`;
    }

    console.error(`[Network Test] Failed:`, error);
    return { connected: false, baseUrl: API_BASE_URL, error, latency };
  }
}
