import { describe, expect, it } from "vitest";
import { allowedBackendPath } from "./backend-request-policy";

describe("allowedBackendPath", () => {
  it("allows only the browser features' backend routes and methods", () => {
    expect(allowedBackendPath("/api/auth/login", "POST")).toBe("/auth/login");
    expect(allowedBackendPath("/api/jobs?limit=12", "GET")).toBe("/jobs?limit=12");
    expect(allowedBackendPath("/me/jobs/matches?page=2", "GET")).toBe("/me/jobs/matches?page=2");
    expect(allowedBackendPath("/api/me/preferences", "PUT")).toBe("/me/preferences");
  });

  it("rejects arbitrary backend paths and encoded path escapes", () => {
    expect(allowedBackendPath("/api/scrape", "GET")).toBeNull();
    expect(allowedBackendPath("/api/admin/secrets", "GET")).toBeNull();
    expect(allowedBackendPath("https://other.example/api/jobs", "GET")).toBeNull();
    expect(allowedBackendPath("/api/jobs%2Fsecret", "GET")).toBeNull();
    expect(allowedBackendPath("/api/../admin/secrets", "GET")).toBeNull();
  });
});
