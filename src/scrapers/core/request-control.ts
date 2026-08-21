type SourceMetrics = {
  requests: number;
  retries: number;
  failures: number;
  totalMs: number;
};
const metrics = new Map<string, SourceMetrics>();
const lastRequestAt = new Map<string, number>();
export async function sourceRequest<T>(
  source: string,
  request: () => Promise<T>,
  minDelayMs = 350,
  retries = 2,
) {
  const state = metrics.get(source) || {
    requests: 0,
    retries: 0,
    failures: 0,
    totalMs: 0,
  };
  metrics.set(source, state);
  for (let attempt = 0; attempt <= retries; attempt++) {
    const wait = Math.max(0, minDelayMs - (Date.now() - (lastRequestAt.get(source) || 0)));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt.set(source, Date.now());
    state.requests++;
    const started = Date.now();
    try {
      const result = await request();
      state.totalMs += Date.now() - started;
      return result;
    } catch (error) {
      state.totalMs += Date.now() - started;
      if (attempt === retries) {
        state.failures++;
        throw error;
      }
      state.retries++;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  throw new Error(`Request failed for ${source}`);
}
export function getSourceMetrics() {
  return Object.fromEntries(
    Array.from(metrics.entries()).map(([source, value]) => [
      source,
      {
        ...value,
        averageMs: value.requests ? Math.round(value.totalMs / value.requests) : 0,
      },
    ]),
  );
}
