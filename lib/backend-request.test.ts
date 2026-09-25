import { afterEach, describe, expect, it, vi } from "vitest";
import { requestBackend } from "../server/actions/backend-request";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("requestBackend", () => {
  it("sends an allowed request from the server to the configured backend", async () => {
    vi.stubEnv("BACKEND_API_URL", "https://backend.example.com/api");
    const upstream = vi.fn(
      async () =>
        new Response(JSON.stringify({ jobs: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", upstream);

    const reply = await requestBackend({
      path: "/api/jobs?limit=12",
      method: "GET",
      headers: [],
    });

    expect(upstream).toHaveBeenCalledWith(
      "https://backend.example.com/api/jobs?limit=12",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(reply.status).toBe(200);
    expect(JSON.parse(Buffer.from(reply.bodyBase64, "base64").toString())).toEqual({ jobs: [] });
  });

  it("rejects unapproved routes before making a backend request", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);

    await expect(
      requestBackend({ path: "/api/admin/secrets", method: "GET", headers: [] }),
    ).rejects.toThrow("Unsupported backend request");
    expect(upstream).not.toHaveBeenCalled();
  });
});
