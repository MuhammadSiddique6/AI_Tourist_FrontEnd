import { API_BASE_URL } from "../config";

const BASE_URL = API_BASE_URL;
const REQUEST_TIMEOUT = 15000; // 15 seconds — fine for auth/JSON
const AI_REQUEST_TIMEOUT = 120000; // 2 min — landmark model load + predict can be slow

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

type RequestOptions = RequestInit & { timeoutMs?: number };

async function request(path: string, opts: RequestOptions = {}) {
  const timeoutMs = opts.timeoutMs ?? REQUEST_TIMEOUT;
  const { timeoutMs: _ignored, ...fetchOpts } = opts;
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
  };
  // Only set Content-Type for POST/PUT/PATCH with body
  if (
    (fetchOpts.method === "POST" || fetchOpts.method === "PUT" || fetchOpts.method === "PATCH") &&
    fetchOpts.body
  ) {
    const isFormData =
      typeof FormData !== "undefined" && fetchOpts.body instanceof FormData;
    if (!isFormData) headers["Content-Type"] = "application/json";
  }
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const url = `${BASE_URL}${path}`;
  const logPrefix = `[API ${fetchOpts.method || "GET"} ${path}]`;

  console.log(`${logPrefix} Connecting to ${url} (timeout ${timeoutMs}ms)`);
  console.log(`${logPrefix} Headers:`, headers);
  if (fetchOpts.body && !(fetchOpts.body instanceof FormData)) {
    console.log(`${logPrefix} Body:`, fetchOpts.body);
  }

  let timedOut = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const res = await fetch(url, {
      ...fetchOpts,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`${logPrefix} Status: ${res.status}`);

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const message =
        data?.message || data?.error || res.statusText || "Request failed";
      console.error(`${logPrefix} Error: ${message}`, data);
      const err: any = new Error(message);
      err.status = res.status;
      err.body = data;
      throw err;
    }

    console.log(`${logPrefix} Success`);
    return data;
  } catch (err: any) {
    if (timedOut || err.name === "AbortError") {
      const message =
        timeoutMs > REQUEST_TIMEOUT
          ? `AI request timed out after ${timeoutMs / 1000}s. The model may still be loading — try again.`
          : `Request timeout after ${timeoutMs}ms. Check if backend is reachable at ${BASE_URL}`;
      console.error(`${logPrefix} ${message}`);
      throw new Error(message);
    }

    console.error(`${logPrefix} Network Error:`, err.message);
    throw new Error(
      `Network error: ${err.message}. Check if your backend is running and accessible at ${BASE_URL}`,
    );
  }
}

export const auth = {
  async login(email: string, password: string) {
    return request(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async register(displayName: string, email: string, password: string) {
    // backend expects `name` instead of `displayName`
    return request(`/auth/register`, {
      method: "POST",
      body: JSON.stringify({ name: displayName, email, password }),
    });
  },
  async forgotPassword(email: string) {
    return request(`/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  async resendOtp(email: string) {
    return request(`/auth/resend-otp`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  async resetPassword(email: string, otp_code: string, password: string) {
    return request(`/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify({ email, otp_code, password }),
    });
  },
};

export const landmarks = {
  async getAll() {
    return request(`/landmarks`, { method: "GET" });
  },
  async getById(id: string) {
    return request(`/landmarks/${id}`, { method: "GET" });
  },
};

export const translate = {
  async translateText(text: string, target = "en") {
    return request(`/translate`, {
      method: "POST",
      body: JSON.stringify({ text, target }),
    });
  },
};

export const admin = {
  async getUsers() {
    return request(`/admin/users`, { method: "GET" });
  },
  async blockUser(id: string | number) {
    return request(`/admin/users/${id}/block`, { method: "PUT" });
  },
  async unblockUser(id: string | number) {
    return request(`/admin/users/${id}/unblock`, { method: "PUT" });
  },
  async deleteUser(id: string | number) {
    return request(`/admin/users/${id}`, { method: "DELETE" });
  },
};

export const ai = {
  async recognize(file: { uri: string; name?: string; type?: string }) {
    const form = new FormData();
    form.append("image", {
      uri: file.uri,
      name: file.name || "photo.jpg",
      type: file.type || "image/jpeg",
    } as any);

    return request(`/ai/recognize`, {
      method: "POST",
      body: form,
      timeoutMs: AI_REQUEST_TIMEOUT,
    });
  },
};

export default { setAuthToken, auth, admin, landmarks, translate, ai };
