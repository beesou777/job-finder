const routes: Record<string, RegExp[]> = {
  GET: [
    /^\/(?:jobs|categories|linkedin-jobs)$/,
    /^\/linkedin-jobs\/[^/]+$/,
    /^\/auth\/me$/,
    /^\/me\/(?:cv|saved-jobs|preferences|dashboard\/overview|jobs\/matches)$/,
    /^\/(?:analytics|analytics\/export|companies\/enriched-from-jobs|companies\/export|admin\/opportunities)$/,
  ],
  POST: [
    /^\/auth\/(?:login|register)$/,
    /^\/(?:chat|scrape|interview\/session|interview\/evaluate)$/,
    /^\/me\/(?:cv|saved-jobs)$/,
  ],
  PUT: [/^\/me\/preferences$/],
  DELETE: [/^\/me\/(?:cv|saved-jobs)$/],
};

export function allowedBackendPath(path: string, method: string): string | null {
  if (path.length > 2048 || (!path.startsWith("/api/") && !path.startsWith("/me/"))) {
    return null;
  }

  try {
    const parsed = new URL(path, "https://frontend.invalid");
    const endpoint = parsed.pathname.startsWith("/api/")
      ? parsed.pathname.slice(4)
      : parsed.pathname;
    if (
      parsed.origin !== "https://frontend.invalid" ||
      parsed.hash ||
      endpoint.includes("%") ||
      !routes[method]?.some((route) => route.test(endpoint))
    ) {
      return null;
    }
    return `${endpoint}${parsed.search}`;
  } catch {
    return null;
  }
}
