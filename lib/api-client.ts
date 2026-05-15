import { auth } from "./firebase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("firebaseToken="))
    ?.split("=")[1];
  return cookieValue || null;
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  let headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add Firebase ID token to auth-required requests
  if (requireAuth) {
    let idToken: string | null = null;

    if (auth.currentUser) {
      idToken = await auth.currentUser.getIdToken();
    }

    // Fallback to cookie token if currentUser is not available yet
    if (!idToken) {
      idToken = getTokenFromCookie();
    }

    if (!idToken) {
      throw new Error("Authentication required");
    }
    headers = {
      ...headers,
      Authorization: `Bearer ${idToken}`,
    };
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }

  return data;
}
