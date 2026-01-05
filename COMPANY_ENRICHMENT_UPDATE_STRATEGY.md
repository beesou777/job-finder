# Company Enrichment Update Strategy

## Overview

This document outlines the strategy for updating company enrichments when jobs are scraped.

## Current Architecture

1. **Company Enrichment** - Stores contact info, career pages, hiring signals
2. **Hiring Intent Score** - Calculated from multiple signals (career page, keywords, job activity, etc.)
3. **Job Scraping** - Scrapes jobs from various sources, stores company names as strings

## The Challenge

When jobs are scraped:
- Jobs have company names as strings (e.g., "F1Soft International")
- We need to link these to enriched companies
- Update job activity signals (jobsLast7Days, jobsLast30Days, uniqueJobCategories)
- Recalculate hiring intent scores

## Recommended Approach: Hybrid Strategy

### Phase 1: Post-Scraping Batch Update (Current Implementation)

**When**: After scraping completes

**How**: 
1. Run scraping (creates/updates Job records)
2. Call `updateEnrichmentsAfterScraping()` 
3. Updates all enrichments with latest job activity
4. Recalculates all intent scores

**Pros**:
- Simple to implement
- Ensures all data is up-to-date
- Good for scheduled scraping (e.g., daily)

**Cons**:
- Can be slow if many companies
- All-or-nothing approach

**Code Location**: `app/services/JobScrapingEnrichmentService.ts`

**Usage**:
```typescript
import { updateEnrichmentsAfterScraping } from "@/app/services/JobScrapingEnrichmentService";

// After scraping completes
const result = await updateEnrichmentsAfterScraping();
console.log(`Updated ${result.companiesUpdated} companies`);
```

### Phase 2: Incremental Updates (Future Optimization)

**When**: During scraping (optional optimization)

**How**:
1. Track unique company names during scraping
2. After scraping batch, call `batchUpdateEnrichmentsForCompanies(companyNames)`
3. Only updates enrichments for companies that had jobs scraped

**Pros**:
- More efficient (only updates relevant companies)
- Faster for large datasets
- Better for frequent scraping

**Cons**:
- Slightly more complex
- Requires tracking company names

**Usage**:
```typescript
import { batchUpdateEnrichmentsForCompanies } from "@/app/services/JobScrapingEnrichmentService";

// Collect company names during scraping
const companyNames = [...new Set(jobs.map(j => j.company))];

// After scraping
await batchUpdateEnrichmentsForCompanies(companyNames);
```

### Phase 3: Real-time Updates (Future - Advanced)

**When**: During job creation (optional)

**How**:
1. When a job is created, check if company has enrichment
2. Incrementally update job counts
3. Trigger score recalculation

**Pros**:
- Always up-to-date
- Real-time signals

**Cons**:
- More database queries per job
- Can slow down scraping
- Complex to implement correctly

## Integration Points

### Option A: Update in Scrape API Route (Recommended)

**Location**: `app/api/scrape/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // ... existing scraping code ...
  
  // After scraping completes
  const { updateEnrichmentsAfterScraping } = await import("@/app/services/JobScrapingEnrichmentService");
  await updateEnrichmentsAfterScraping();
  
  return NextResponse.json({ success: true, ... });
}
```

### Option B: Scheduled Background Job (Future)

Create a cron job or scheduled task that:
1. Runs after scraping completes
2. Updates all enrichments
3. Can run independently

### Option C: Manual Trigger (Current)

Admin can manually trigger recalculation via API:
- `PUT /api/companies/intent` (recalculates all)

## Performance Considerations

1. **Batch Updates**: Update in batches (e.g., 50 companies at a time)
2. **Caching**: Cache job counts to avoid repeated queries
3. **Indexing**: Ensure proper indexes on Job.company and Job.postedAt
4. **Async Processing**: Consider queue-based processing for large datasets

## Current Implementation Status

✅ **Service Created**: `JobScrapingEnrichmentService.ts`
- `updateEnrichmentsAfterScraping()` - Updates all enrichments
- `updateEnrichmentForCompany()` - Updates single company
- `batchUpdateEnrichmentsForCompanies()` - Batch update

⏳ **Integration**: Not yet integrated into scraping route
- Need to add call in `app/api/scrape/route.ts`
- Or create separate endpoint/script

## Recommendations

1. **Start Simple**: Use Option A (update in scrape route)
2. **Monitor Performance**: If slow, optimize with batch updates
3. **Add Monitoring**: Track how long updates take
4. **Consider Queues**: For production, use job queues for async processing

## Example Integration

```typescript
// In app/api/scrape/route.ts

export async function POST(request: NextRequest) {
  try {
    // ... existing scraping logic ...
    
    const allJobs = await runAllScrapers();
    
    // Save jobs to database
    for (const jobData of allJobs) {
      // ... existing job saving logic ...
    }
    
    // Update company enrichments after scraping
    try {
      const { updateEnrichmentsAfterScraping } = await import("@/app/services/JobScrapingEnrichmentService");
      const enrichmentResult = await updateEnrichmentsAfterScraping();
      console.log(`✅ Updated ${enrichmentResult.companiesUpdated} company enrichments`);
    } catch (enrichmentError) {
      console.error("⚠️ Error updating enrichments (non-fatal):", enrichmentError);
      // Don't fail the scraping job if enrichment update fails
    }
    
    return NextResponse.json({
      success: true,
      jobsSaved: saved,
      companiesUpdated: enrichmentResult?.companiesUpdated || 0,
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

