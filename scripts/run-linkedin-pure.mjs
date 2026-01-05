
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const CONFIG = {
    headless: true,
    maxJobs: 50,
    outputFile: 'linkedin_jobs.json',
    keywords: ['Software Engineer', 'Developer', 'Intern', 'IT', 'Marketing'],
};

// --- Utils ---
function cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

function saveJobs(jobs) {
    const outputPath = path.join(process.cwd(), CONFIG.outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2));
}

const SELECTORS = {
    JOB_CARD: '.base-card',
    JOB_CARD_LINK: '.base-card__full-link',
    DETAIL_TITLE: '.top-card-layout__title',
    DETAIL_COMPANY: '.top-card-layout__second-sub-line .top-card-layout__first-sub-line-item',
    DETAIL_LOCATION: '.top-card-layout__first-sub-line .top-card-layout__second-sub-line-item',
    DETAIL_DESCRIPTION: '.description__text',
    DETAIL_POSTED_TIME: '.posted-time-ago__text',
    criteria_item: '.description__job-criteria-item',
    criteria_header: '.description__job-criteria-subheader',
    criteria_text: '.description__job-criteria-text',
    show_more_btn: 'button.show-more-less-html__button--more'
};

async function launchBrowser() {
    return await chromium.launch({
        headless: CONFIG.headless,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"'
        ]
    });
}

async function runScraper() {
    console.log('🚀 Starting LinkedIn Scraper (Robust Mode)...');
    
    let browser = await launchBrowser();
    let context = await browser.newContext();
    let page = await context.newPage();

    // State
    let allJobs = [];
    const visitedUrls = new Set();
    const detailQueue = [];

    // --- PHASE 1: Search ---
    try {
        for (const keyword of CONFIG.keywords) {
            if (allJobs.length >= CONFIG.maxJobs) break;

            const searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keyword)}&location=Nepal&f_TPR=r604800`;
            console.log(`\n🔍 Searching: ${keyword}`);
            
            try {
                if (!browser.isConnected()) {
                     console.log('  ⚠️ Browser disconnected, relaunching...');
                     browser = await launchBrowser();
                     context = await browser.newContext();
                     page = await context.newPage();
                }

                await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForSelector('.base-card', { timeout: 10000 }).catch(() => {});

                // Scroll
                for (let i = 0; i < 3; i++) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
                    await page.waitForTimeout(1000);
                }

                // Extract
                const jobCards = await page.$$('.base-card');
                console.log(`  found ${jobCards.length} cards`);

                for (const card of jobCards) {
                    const linkEl = await card.$('.base-card__full-link');
                    if (linkEl) {
                        const href = await linkEl.getAttribute('href');
                        if (href) {
                            const cleanLink = href.split('?')[0];
                            if (!visitedUrls.has(cleanLink)) {
                                visitedUrls.add(cleanLink);
                                detailQueue.push(cleanLink);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(`  ❌ Error searching ${keyword}:`, err.message);
                // Try to recover browser if needed
                try { await browser.close(); } catch {}
                browser = await launchBrowser();
                context = await browser.newContext();
                page = await context.newPage();
            }
        }
    } catch (e) {
        console.error("Fatal search error:", e);
    }
    
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
    
    console.log(`\n📋 Final Queue size: ${detailQueue.length}. Starting detail extraction (Full Isolation Mode)...`);

    // --- PHASE 2: Details ---
    let processedCount = 0;
    
    for (const url of detailQueue) {
        if (allJobs.length >= CONFIG.maxJobs) break;
        processedCount++;
        
        console.log(`\n[${processedCount}/${detailQueue.length}] Scraping: ${url}`);

        let currentBrowser = null;
        try {
            // Launch fresh browser for EVERY job for absolute safety in this environment
            currentBrowser = await launchBrowser();
            const currentContext = await currentBrowser.newContext();
            const detailPage = await currentContext.newPage();
            
            // Randomize user agent slightly
            await currentContext.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
            });

            await detailPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            
            // Check for auth wall
            if (detailPage.url().includes('linkedin.com/auth') || detailPage.url().includes('login')) {
                 console.log('  ⚠️ Hit Auth Wall / Login Redirect. Skipping this URL.');
                 continue;
            }

            // Wait for content (be generous with timeout)
            await detailPage.waitForSelector(SELECTORS.DETAIL_TITLE, { timeout: 15000 }).catch(() => {});

             // Click show more
            const showMore = await detailPage.$(SELECTORS.show_more_btn);
            if (showMore) {
                await showMore.click().catch(() => {});
                await detailPage.waitForTimeout(500);
            }

            const title = await detailPage.textContent(SELECTORS.DETAIL_TITLE).catch(() => null);
            if (!title) {
                console.log('  ❌ Could not extract title (likely blocked or generic page)');
                continue;
            }

            const company = await detailPage.textContent(SELECTORS.DETAIL_COMPANY).catch(() => null);
            const location = await detailPage.textContent(SELECTORS.DETAIL_LOCATION).catch(() => null);
            const description = await detailPage.innerHTML(SELECTORS.DETAIL_DESCRIPTION).catch(() => '');
            const postedAt = await detailPage.textContent(SELECTORS.DETAIL_POSTED_TIME).catch(() => null);

            // Criteria
            const criteria = {};
            try {
                const criteriaItems = await detailPage.$$(SELECTORS.criteria_item);
                for (const item of criteriaItems) {
                    const header = await item.$eval(SELECTORS.criteria_header, el => el.textContent).catch(() => null);
                    const val = await item.$eval(SELECTORS.criteria_text, el => el.textContent).catch(() => null);
                    if (header && val) criteria[cleanText(header)] = cleanText(val);
                }
            } catch (e) {}

            const jobData = {
                title: cleanText(title),
                company: cleanText(company),
                location: cleanText(location),
                description,
                applyUrl: url,
                source: 'linkedin',
                postedAt: cleanText(postedAt),
                criteria,
                scrapedAt: new Date().toISOString()
            };

            allJobs.push(jobData);
            console.log(`  ✅ Successfully scraped: ${jobData.title}`);
            saveJobs(allJobs); // Incremental save

        } catch (err) {
            console.error(`  ❌ Critical Error for ${url}: ${err.message}`);
        } finally {
            if (currentBrowser) {
                await currentBrowser.close().catch(() => {});
            }
            // Sleep between jobs to avoid IP-based rate limits
            const delay = 2000 + Math.random() * 3000;
            await new Promise(r => setTimeout(r, delay));
        }
    }

    console.log(`\n🎉 Scraping process complete. Total jobs saved: ${allJobs.length}`);
}

runScraper().then(() => process.exit(0)).catch((err) => {
    console.error('Final Scraper Failure:', err);
    process.exit(1);
});
