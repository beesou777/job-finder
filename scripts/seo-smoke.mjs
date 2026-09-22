const baseUrl = (process.env.SEO_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

function match(html, pattern) {
  return html.match(pattern)?.[1] || "";
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function inspect(path, expectation = {}) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const html = await response.text();
  assert(response.status === (expectation.status || 200), `${path}: status ${response.status}`);
  if (expectation.html !== false) {
    const title = match(html, /<title>(.*?)<\/title>/s);
    const description = match(html, /<meta name="description" content="(.*?)"/s);
    const canonical = match(html, /<link rel="canonical" href="(.*?)"/s);
    const robots = match(html, /<meta name="robots" content="(.*?)"/s);
    assert(title, `${path}: missing title`);
    assert(description || expectation.status === 404, `${path}: missing description`);
    assert(canonical || expectation.status === 404, `${path}: missing canonical`);
    assert(/<h1[\s>]/i.test(html) || expectation.status === 404, `${path}: missing H1`);
    if (expectation.noindex) assert(robots.includes("noindex"), `${path}: expected noindex`);
    if (expectation.jobLinks) {
      assert((html.match(/href="\/job\//g) || []).length > 0, `${path}: no SSR job links`);
    }
    if (expectation.schema)
      assert(
        html.includes(`\"@type\":\"${expectation.schema}\"`),
        `${path}: missing ${expectation.schema} schema`,
      );
  }
  process.stdout.write(`PASS ${path}\n`);
  return { response, html };
}

await inspect("/", { schema: "WebSite", jobLinks: true });
await inspect("/jobs", { jobLinks: true });
await inspect("/jobs?search=developer", { noindex: true, jobLinks: true });
await inspect("/jobs-in-nepal", { jobLinks: true });
await inspect("/jobs-in-kathmandu", { jobLinks: true });
await inspect("/internships", { jobLinks: true });
const categoriesResponse = await fetch(`${baseUrl}/api/categories?limit=100`);
const categoriesPayload = await categoriesResponse.json();
const category = categoriesPayload.data?.find((item) =>
  /^[A-Za-z][A-Za-z &/-]{2,}$/.test(String(item.name || "")),
);
if (category?.slug) await inspect(`/jobs/category/${category.slug}`, { noindex: true });
else process.stdout.write("SKIP category: API returned no representative category\n");
await inspect("/skills/react", { jobLinks: true });
await inspect("/blog/how-to-find-jobs-in-nepal", { schema: "BlogPosting" });

const jobsResponse = await fetch(`${baseUrl}/api/jobs?limit=1`);
const jobsPayload = await jobsResponse.json();
const activeJob = jobsPayload.data?.[0];
if (activeJob?.id) await inspect(`/job/${activeJob.id}`, { schema: "JobPosting" });
else process.stdout.write("SKIP active job: API returned no representative record\n");

await inspect("/job/00000000-0000-4000-8000-000000000000", { status: 404 });
process.stdout.write("SKIP expired job: the public active-jobs API exposes no expired fixture\n");
await inspect("/robots.txt", { html: false });
await inspect("/sitemap.xml", { html: false });
