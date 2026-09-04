import type { ApiErrorPayload } from "@/types/database";

function errorMessage(payload: unknown, fallback: string) {
  const candidate = payload as Partial<ApiErrorPayload>;
  const message = candidate?.error?.message;
  const fields = candidate?.error?.fields;
  if (message && fields?.length) {
    return `${message} ${fields.map((item) => `${item.field}: ${item.message}`).join(" ")}`;
  }
  return message || fallback;
}

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (response.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`The server returned ${response.status} without valid JSON.`);
  }

  if (!response.ok) {
    throw new Error(errorMessage(payload, `Request failed with status ${response.status}.`));
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
