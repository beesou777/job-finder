import axios, { AxiosRequestConfig } from "axios";

export interface FetchOptions {
  retries?: number;
  delay?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Fetch a page with retry logic, delays, and proper error handling
 */
export async function fetchPage(
  url: string,
  options: FetchOptions = {},
): Promise<{ data: string; status: number } | null> {
  const { retries = 3, delay = 0, timeout = 15000, headers = {} } = options;

  // Random delay between 300-1200ms to avoid rate limiting
  const randomDelay = delay || Math.floor(Math.random() * 900) + 300;
  await sleep(randomDelay);

  const defaultHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: getDomain(url),
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    ...headers,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: defaultHeaders,
        timeout,
        validateStatus: (status) => status < 500, // Don't throw on 4xx
        maxRedirects: 5,
      });

      if (response.status === 200) {
        return { data: response.data, status: response.status };
      }

      // If 404 or other client error, return null (not retry)
      if (response.status >= 400 && response.status < 500) {
        return null;
      }

      // For server errors, retry
      if (attempt < retries) {
        const backoffDelay = attempt * 1000; // Exponential backoff
        await sleep(backoffDelay);
      }
    } catch (error: any) {
      const isLastAttempt = attempt === retries;

      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        // Domain doesn't exist or connection refused - don't retry
        return null;
      }

      if (isLastAttempt) {
        console.error(`❌ Failed to fetch ${url} after ${retries} attempts:`, error.message);
        return null;
      }

      // Wait before retry
      const backoffDelay = attempt * 1000;
      await sleep(backoffDelay);
    }
  }

  return null;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract domain from URL
 */
function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return "";
  }
}
