
import { runLinkedinScraper } from '../src/scrapers/linkedin';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Starting LinkedIn Scraper Job...');
    try {
        const jobs = await runLinkedinScraper({
            maxJobs: 10,
            headless: process.env.HEADLESS !== 'false'
        });

        const outputPath = path.join(process.cwd(), 'linkedin_jobs.json');
        fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2));
        console.log(`Saved ${jobs.length} jobs to ${outputPath}`);

    } catch (error) {
        console.error('Error running LinkedIn scraper:', error);
        process.exit(1);
    }
}

main();
