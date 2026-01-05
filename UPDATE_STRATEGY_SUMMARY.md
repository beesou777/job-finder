# Company Enrichment Update Strategy - Quick Summary

## Your Question: How are we updating company enrichment?

**Answer**: Post-scraping batch update (recommended approach)

## How It Works

### Current Implementation (Recommended)

1. **After Scraping Completes**:
   - All jobs are saved to database
   - System automatically calls `updateEnrichmentsAfterScraping()`
   - Updates job activity signals for all enriched companies
   - Recalculates hiring intent scores

2. **Location**: Integrated into `app/api/scrape/route.ts`

3. **When You Scrape Jobs**:
   ```bash
   # Via API
   POST /api/scrape
   
   # Or via script
   npm run scrape
   ```
   → Automatically updates all company enrichments after scraping

### Why This Approach?

✅ **Simple & Reliable**
- One call after scraping
- Ensures all data is consistent
- Easy to debug

✅ **Performance**
- Batch updates (efficient)
- Doesn't slow down scraping
- Can run in background

✅ **Maintainability**
- Clear separation of concerns
- Scraping logic stays simple
- Enrichment logic is isolated

### Alternative: Update During Scraping

**Your idea**: Update enrichment while scraping each job

**Pros**:
- Real-time updates
- More granular

**Cons**:
- Slower scraping (DB query per company)
- More complex error handling
- Can block scraping if enrichment fails
- Harder to debug

**My Recommendation**: Stick with post-scraping batch update

## What Gets Updated

When enrichment runs, it updates:

1. **Job Activity Signals**:
   - `jobsLast7Days` - Jobs posted in last 7 days
   - `jobsLast30Days` - Jobs posted in last 30 days  
   - `uniqueJobCategories` - Number of different categories

2. **Hiring Intent Score**:
   - Recalculated from all signals
   - Score range: 0-150
   - Level: LOW / MEDIUM / HIGH / VERY_HIGH

3. **Score History**:
   - Records score changes
   - Tracks what triggered the change

## Current Status

✅ **Service Created**: `JobScrapingEnrichmentService.ts`
✅ **Integrated**: Added to scrape route
✅ **Ready to Use**: Will run automatically after scraping

## Next Steps

1. **Scrape Jobs**: Run scraping to populate jobs
2. **Auto-Update**: Enrichments update automatically
3. **View Results**: Check dashboard for updated scores

## Manual Update (If Needed)

You can also manually trigger updates:

```bash
# Via API
PUT /api/companies/intent
# (recalculates all scores)
```

Or use the service directly:
```typescript
import { updateEnrichmentsAfterScraping } from "@/app/services/JobScrapingEnrichmentService";
await updateEnrichmentsAfterScraping();
```

## Summary

- **When**: After scraping completes (automatic)
- **What**: Updates job activity signals & recalculates scores
- **How**: Batch update all enrichments
- **Why**: Simple, reliable, performant

The system is ready! Just scrape jobs and enrichment will update automatically.

