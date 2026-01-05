import { PlaywrightCrawler, Dataset } from 'crawlee';
import fs from 'fs';
import path from 'path';

// --- Constants ---
const LABELS = {
    SEARCH: 'SEARCH',
    DETAIL: 'DETAIL',
};

const SELECTORS = {
    JOB_CARD: '.base-card',
    JOB_CARD_LINK: '.base-card__full-link',
    DETAIL_TITLE: '.top-card-layout__title',
    DETAIL_COMPANY: '.top-card-layout__second-sub-line .top-card-layout__first-sub-line-item',
    DETAIL_LOCATION: '.top-card-layout__first-sub-line .top-card-layout__second-sub-line-item',
    DETAIL_DESCRIPTION: '.description__text',
    DETAIL_POSTED_TIME: '.posted-time-ago__text',
    DETAIL_CRITERIA_ITEM: '.description__job-criteria-item',
    DETAIL_CRITERIA_HEADER: '.description__job-criteria-subheader',
    DETAIL_CRITERIA_TEXT: '.description__job-criteria-text',
};

// --- Utils ---
function cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

// --- Main Scraper ---
async function runScraper() {
    console.log('🚀 Starting LinkedIn Scraper (Standalone ESM)...');

    const router = new PlaywrightCrawler({
        // Headless mode
        headless: true,
        
        // Stealth
        launchContext: {
            useChrome: false,
            launchOptions: {
                args: ['--disable-blink-features=AutomationControlled'],
            },
        },
        
        requestHandler: async ({ page, request, log, pushData, enqueueLinks }) => {
            const { label } = request.userData;

            if (label === LABELS.SEARCH) {
                log.info(`Processing Search: ${request.url}`);
                try {
                    await page.waitForSelector(SELECTORS.JOB_CARD, { timeout: 10000 });
                } catch {
                    log.warning('No job cards found.');
                    return;
                }

                // Scroll
                await page.evaluate(async () => {
                    for (let i = 0; i < 4; i++) {
                        window.scrollTo(0, document.body.scrollHeight);
                        await new Promise(r => setTimeout(r, 1000));
                    }
                });

                const jobCards = await page.$$(SELECTORS.JOB_CARD);
                log.info(`Found ${jobCards.length} cards.`);

                for (const card of jobCards) {
                    const linkEl = await card.$(SELECTORS.JOB_CARD_LINK);
                    if (linkEl) {
                        const href = await linkEl.getAttribute('href');
                        if (href) {
                            const absoluteUrl = new URL(href, page.url()).href.split('?')[0];
                            await enqueueLinks({
                                urls: [absoluteUrl],
                                userData: { label: LABELS.DETAIL }
                            });
                        }
                    }
                }
            } else if (label === LABELS.DETAIL) {
                log.info(`Processing Detail: ${request.url}`);
                
                try {
                    await page.waitForSelector(SELECTORS.DETAIL_TITLE, { timeout: 10000 });
                } catch {
                    log.warning('Title not found on detail page.');
                    return;
                }
                
                 // Expand description if "Show more" button exists
                const showMoreBtn = await page.$('button.show-more-less-html__button--more');
                if (showMoreBtn) {
                    try {
                        await showMoreBtn.click();
                        await page.waitForTimeout(500);
                    } catch {}
                }

                const title = await page.textContent(SELECTORS.DETAIL_TITLE).catch(() => null);
                const company = await page.textContent(SELECTORS.DETAIL_COMPANY).catch(() => null);
                const location = await page.textContent(SELECTORS.DETAIL_LOCATION).catch(() => null);
                const description = await page.innerHTML(SELECTORS.DETAIL_DESCRIPTION).catch(() => '');
                const postedAt = await page.textContent(SELECTORS.DETAIL_POSTED_TIME).catch(() => null);

                const jobData = {
                    title: cleanText(title),
                    company: cleanText(company),
                    location: cleanText(location),
                    description: description, // Keep HTML
                    applyUrl: request.url,
                    source: 'linkedin',
                    postedAt: cleanText(postedAt),
                    scrapedAt: new Date().toISOString(),
                };

                await pushData(jobData);
                log.info(`Saved: ${jobData.title}`);
            }
        },
    });

    // Start URLs
    const keywords = ['Software Engineer', 'Nepal'];
    const startUrls = keywords.map(k => ({
        url: `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(k)}&location=Nepal&f_TPR=r604800`,
        userData: { label: LABELS.SEARCH }
    }));

    await router.run(startUrls);

    // Export
    const dataset = await Dataset.open();
    const { items } = await dataset.getData();
    
    fs.writeFileSync('linkedin_jobs_standalone.json', JSON.stringify(items, null, 2));
    console.log(`✅ Done. Saved ${items.length} jobs to linkedin_jobs_standalone.json`);
}

runScraper().catch(console.error);
