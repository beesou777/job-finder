import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  console.log('🚀 Starting Pure Playwright Scraper...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'] 
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();
  
  try {
    const url = 'https://www.linkedin.com/jobs/search?keywords=Software%20Engineer&location=Nepal';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log('Page loaded. waiting for job cards...');
    try {
        await page.waitForSelector('.base-card', { timeout: 10000 });
    } catch (e) {
        console.log('Timeout waiting for selector, but continuing to snapshot.');
    }

    const title = await page.title();
    console.log(`Title: ${title}`);
    
    const jobCards = await page.$$('.base-card');
    console.log(`Found ${jobCards.length} job cards.`);
    
    // Save snapshot
    await page.screenshot({ path: 'linkedin_snapshot.png' });
    console.log('Saved screenshot.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
