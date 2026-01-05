
import { createRouter } from './routes';
import { BASE_URL, LABELS, SEARCH_URL_PARAMS } from './consts';

interface ScraperOptions {
    maxPages?: number;
    maxJobs?: number;
    headless?: boolean;
}

export async function runLinkedinScraper(options: ScraperOptions = {}) {
    // Dynamic imports
    const { PlaywrightCrawler, Dataset } = await import('crawlee');
    const { maxJobs = 50, headless = true } = options;

    const startUrls = [];
    const keywords = ['Software Engineer', 'Developer', 'Intern', 'IT', 'Marketing'];

    for (const keyword of keywords) {
        const url = new URL(BASE_URL);
        url.searchParams.set('keywords', keyword);
        url.searchParams.set('location', SEARCH_URL_PARAMS.location);
        url.searchParams.set('f_TPR', SEARCH_URL_PARAMS.f_TPR);

        startUrls.push({
            url: url.href,
            label: LABELS.SEARCH,
        });
    }

    const router = await createRouter();

    const crawler = new PlaywrightCrawler({
        requestHandler: router,

        // Options
        maxRequestsPerCrawl: maxJobs * 2,
        headless: headless,

        // Anti-blocking
        useSessionPool: true,
        persistCookiesPerSession: true,

        // Browser specifics
        launchContext: {
            useChrome: false,
            launchOptions: {
                args: ['--disable-blink-features=AutomationControlled'],
            },
        },

        // Hooks
        failedRequestHandler: ({ request, log }) => {
            log.error(`Request ${request.url} failed too many times.`);
        },
    });

    await crawler.run(startUrls);

    // Retrieve data using dynamic Dataset
    const dataset = await Dataset.open();
    const { items } = await dataset.getData();

    console.log(`LinkedIn scraping finished. Collected ${items.length} jobs.`);
    return items;
}
