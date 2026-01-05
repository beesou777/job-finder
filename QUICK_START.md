# Quick Start Guide: Company Enrichment System

## Setup

1. **Install dependencies** (if not already installed):
```bash
npm install
```

2. **Database Migration**:
   The new entities (`CompanyEnrichment`, `HiringIntentScoreHistory`) need to be added to your database.
   
   **Option A: Using TypeORM synchronize** (Development only):
   - Set `DATABASE_SYNC=true` in your `.env` file
   - Restart your application
   
   **Option B: Create migration manually** (Production recommended):
   - Create migration scripts based on the entity definitions
   - Run migrations using your migration tool

## Enrich Companies from JSON Files

Process your existing JSON files to enrich companies:

```bash
# TechBehemoths data (results.json)
tsx scripts/enrich-companies-from-json.ts utils/results.json techbehemoths

# RamroJob companies
tsx scripts/enrich-companies-from-json.ts utils/ramrojob_companies.json ramrojob

# Virit Jobs
tsx scripts/enrich-companies-from-json.ts utils/virit-jobs.json virit

# MeroJob
tsx scripts/enrich-companies-from-json.ts utils/mero-job.json merojob

# WorkHub
tsx scripts/enrich-companies-from-json.ts utils/workhub.json workhub
```

## API Usage

### Get High Intent Companies
```bash
GET /api/companies/intent?level=HIGH&minScore=70&hasContact=true&limit=20
```

### Get Leaderboard
```bash
GET /api/companies/leaderboard?type=intent&limit=20
```

### Export to CSV
```bash
GET /api/companies/export?type=high-intent
```

### Update Sales Notes
```bash
PATCH /api/companies/{companyId}
{
  "salesNotes": "Contacted on 2024-01-15",
  "isPitchTarget": true
}
```

## Key Features

✅ **Company Matching**: Fuzzy matching (94-100% = same company)  
✅ **Hiring Intent Scoring**: Weighted algorithm based on signals  
✅ **Batch Processing**: Process multiple companies at once  
✅ **CSV Export**: Export for sales outreach  
✅ **Score History**: Track score changes over time  
✅ **Career Page Tracking**: Monitor career pages (placeholder)  
✅ **Safety**: No auto-emailing, manual approval required  

## Next Steps

1. Run database migration
2. Process JSON files to enrich companies
3. Test APIs
4. Build admin dashboard UI (optional)
5. Implement career page monitoring (requires HTTP client + HTML parser)

For detailed documentation, see `COMPANY_ENRICHMENT_SYSTEM.md`.

