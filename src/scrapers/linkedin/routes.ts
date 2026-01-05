import { LABELS, SELECTORS } from './consts';
import { cleanText, normalizeJobData } from './utils';
import type { PlaywrightCrawlingContext, RouterHandler } from 'crawlee'; // Type-only import is safe

export async function createRouter() {
    // Dynamic import to handle ESM-only package in CJS environment
    const { createPlaywrightRouter } = await import('crawlee');

    const router = createPlaywrightRouter();

    router.addHandler(LABELS.SEARCH, async ({ page, enqueueLinks, log }) => {
        log.info('Processing Search Page', { url: page.url() });

        // Wait for job cards to load
        try {
            await page.waitForSelector(SELECTORS.JOB_CARD, { timeout: 15000 });
        } catch {
            log.warning('No job cards found on this search page.');
            return;
        }

        // Auto-scroll to load more (basic implementation)
        // Using a safe scroll method to avoid triggering aggressive anti-bot
        let previousHeight = 0;
        for (let i = 0; i < 5; i++) {
            const currentHeight = await page.evaluate(() => document.body.scrollHeight);
            if (currentHeight === previousHeight) break;
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(1000 + Math.random() * 2000); // Random delay
            previousHeight = currentHeight;
        }

        // Extract job links
        const jobCards = await page.$$(SELECTORS.JOB_CARD);
        log.info(`Found ${jobCards.length} job cards`);

        for (const card of jobCards) {
            try {
                const linkEl = await card.$(SELECTORS.JOB_CARD_LINK);
                if (!linkEl) continue;

                const url = await linkEl.getAttribute('href');
                if (url) {
                    // Ensure absolute URL (LinkedIn usually gives relative or absolute but let's be safe)
                    const absoluteUrl = new URL(url, page.url()).href.split('?')[0]; // Remove query params

                    await enqueueLinks({
                        urls: [absoluteUrl],
                        label: LABELS.DETAIL,
                    });
                }
            } catch (err) {
                log.error('Error extracting job card info', { err });
            }
        }
    });

    router.addHandler(LABELS.DETAIL, async ({ page, request, log, pushData }) => {
        log.info('Processing Detail Page', { url: request.url });

        // Wait for content (sometimes "Show more" button needs clicking to see full desc)
        await page.waitForSelector('.top-card-layout__title', { timeout: 15000 }).catch(() => log.warning('Title not found'));

        // Expand description if "Show more" button exists
        const showMoreBtn = await page.$('button.show-more-less-html__button--more');
        if (showMoreBtn) {
            try {
                await showMoreBtn.click();
                await page.waitForTimeout(500);
            } catch { }
        }

        const title = await page.textContent(SELECTORS.DETAIL_TITLE).catch(() => null);
        const company = await page.textContent(SELECTORS.DETAIL_COMPANY).catch(() => null);
        const location = await page.textContent(SELECTORS.DETAIL_LOCATION).catch(() => null);

        // Extract description HTML
        const description = await page.innerHTML(SELECTORS.DETAIL_DESCRIPTION).catch(() => '');

        // Extract metadata criteria
        const criteria: Record<string, string> = {};
        const criteriaItems = await page.$$(SELECTORS.DETAIL_CRITERIA_ITEM);
        for (const item of criteriaItems) {
            const key = await item.$eval(SELECTORS.DETAIL_CRITERIA_HEADER, el => el.textContent?.trim()).catch(() => null);
            const value = await item.$eval(SELECTORS.DETAIL_CRITERIA_TEXT, el => el.textContent?.trim()).catch(() => null);
            if (key && value) {
                criteria[key] = value;
            }
        }

        // Posted at
        const postedAtStr = await page.textContent(SELECTORS.DETAIL_POSTED_TIME).catch(() => null);
        // basic relative date parsing if needed, mostly for logging

        const rawData = {
            title: cleanText(title),
            company: cleanText(company),
            location: cleanText(location),
            description,
            url: request.url,
            criteria,
            postedAt: postedAtStr ? cleanText(postedAtStr) : null,
            scrapedAt: new Date().toISOString(),
        };

        // Normalize and Push
        const normalized = normalizeJobData(rawData, 'linkedin');

        await pushData(normalized);
        log.info(`Scraped job: ${normalized.title} at ${normalized.company}`);
    });

    return router;
}
