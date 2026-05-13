import { clearAuth, getToken } from "@/lib/auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://medinsight-ai-backend.vercel.app";

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
) {
  const { auth = false, headers, ...restOptions } = options;

  const finalHeaders = new Headers(headers || {});

  if (
    !finalHeaders.has("Content-Type") &&
    !(restOptions.body instanceof FormData)
  ) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    finalHeaders.set("Authorization", `Bearer ${token.trim()}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: finalHeaders,
    cache: "no-store",
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}