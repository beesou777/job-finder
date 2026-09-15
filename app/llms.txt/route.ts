const LLMS_CONTENT = `# KamKhoj

> KamKhoj is a Nepal job discovery platform for vacancies, internships, remote roles, and career resources.

## What KamKhoj does

KamKhoj aggregates publicly available job listings from Nepali job portals and employer sources. It helps candidates search and compare roles, then sends them to the original source for the final application.

## Important limitations

- The original employer or job portal is the final authority for salary, eligibility, deadline, documents, and application instructions.
- Listings can change or expire after collection.
- KamKhoj does not submit applications or charge candidates application fees.

## Key pages

- [Home](https://www.kamkhoj.com/)
- [Jobs in Nepal](https://www.kamkhoj.com/jobs-in-nepal)
- [Internships in Nepal](https://www.kamkhoj.com/internships-in-nepal)
- [Remote jobs in Nepal](https://www.kamkhoj.com/remote-jobs-nepal)
- [Career blog](https://www.kamkhoj.com/blog)
- [About KamKhoj](https://www.kamkhoj.com/about)
- [Editorial policy](https://www.kamkhoj.com/editorial-policy)

## Freshness

Job data is refreshed regularly. Always verify current details at the original source before applying.
`;

export function GET() {
  return new Response(LLMS_CONTENT, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
