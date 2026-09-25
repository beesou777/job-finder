import { requestBackend } from "@/server/actions/backend-request";

/** Keep backend requests on the Next.js server while preserving fetch-style callers. */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (init.signal?.aborted) {
    throw new DOMException("The request was aborted", "AbortError");
  }

  if (init.body && typeof init.body !== "string" && !(init.body instanceof FormData)) {
    throw new Error("Unsupported request body");
  }

  const reply = await requestBackend({
    path,
    method: init.method || "GET",
    headers: Array.from(new Headers(init.headers).entries()),
    body: init.body || undefined,
  });
  if (init.signal?.aborted) {
    throw new DOMException("The request was aborted", "AbortError");
  }

  const bytes = Uint8Array.from(atob(reply.bodyBase64), (character) => character.charCodeAt(0));
  return new Response([204, 205, 304].includes(reply.status) ? null : bytes, {
    status: reply.status,
    headers: reply.headers,
  });
}
