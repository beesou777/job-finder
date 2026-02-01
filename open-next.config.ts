import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Use dummy cache to avoid R2 (R2 requires enabling in Cloudflare Dashboard).
  // Trade-off: No ISR/page revalidation; pages are served statically.
  incrementalCache: "dummy",
  tagCache: "dummy",
});
