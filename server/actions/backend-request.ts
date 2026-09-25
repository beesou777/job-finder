"use server";

import { allowedBackendPath } from "../../lib/backend-request-policy";

export interface BackendRequest {
  path: string;
  method: string;
  headers: Array<[string, string]>;
  body?: string | FormData;
}

export interface BackendReply {
  status: number;
  headers: Array<[string, string]>;
  bodyBase64: string;
}

export async function requestBackend(request: BackendRequest): Promise<BackendReply> {
  const method = request.method.toUpperCase();
  const endpoint = allowedBackendPath(request.path, method);
  if (!endpoint) {
    throw new Error("Unsupported backend request");
  }

  if (request.body instanceof FormData && (method !== "POST" || !endpoint.startsWith("/me/cv"))) {
    throw new Error("Unsupported upload request");
  }

  const apiBase = process.env.INTERNAL_API_URL || process.env.BACKEND_API_URL;
  if (!apiBase) {
    throw new Error("Backend API URL is not configured");
  }

  const headers = new Headers();
  for (const [name, value] of request.headers) {
    if (["accept", "authorization", "content-type"].includes(name.toLowerCase())) {
      headers.set(name, value);
    }
  }
  if (request.body instanceof FormData) {
    headers.delete("content-type");
  }

  let response: Response;
  try {
    response = await fetch(`${apiBase.replace(/\/+$/, "")}${endpoint}`, {
      method,
      headers,
      body: request.body,
      cache: "no-store",
    });
  } catch {
    throw new Error("Backend service is unavailable");
  }

  const replyHeaders: Array<[string, string]> = [];
  for (const name of ["content-type", "content-disposition"]) {
    const value = response.headers.get(name);
    if (value) replyHeaders.push([name, value]);
  }

  return {
    status: response.status,
    headers: replyHeaders,
    bodyBase64: Buffer.from(await response.arrayBuffer()).toString("base64"),
  };
}
