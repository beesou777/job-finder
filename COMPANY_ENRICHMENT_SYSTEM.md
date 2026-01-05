# Company Enrichment & Hiring Intent Intelligence System

## Overview

A comprehensive system for enriching company data, matching external sources, calculating hiring intent scores, and powering sales outreach for a Nepal-focused job aggregation platform.

## Architecture

### Database Entities

1. **CompanyEnrichment** (`entities/CompanyEnrichment.ts`)
   - Overlay on top of `CanonicalCompany`
   - Stores contact info, career pages, hiring signals
   - Tracks matching confidence and source
   - Contains current hiring intent score and level

2. **HiringIntentScoreHistory** (`entities/HiringIntentScoreHistory.ts`)
   - Historical tracking of score changes
   - Signal breakdown for each score update
   - Trigger tracking (what caused the change)

### Core Services

1. **CompanyMatchingService** (`app/services/CompanyMatchingService.ts`)
   - Fuzzy string matching using `string-similarity`
   - Domain matching
   - Normalized name matching
   - Match confidence levels (HIGH: 94-100%, MEDIUM: 80-93%, LOW: <80%)

2. **HiringIntentScoringService** (`app/services/HiringIntentScoringService.ts`)
   - Weighted signal scoring algorithm
   - Job activity calculation from Job table
   - Score history tracking
   - Intent level calculation (LOW, MEDIUM, HIGH, VERY_HIGH)

3. **CompanyEnrichmentService** (`app/services/CompanyEnrichmentService.ts`)
   - Main enrichment orchestration
   - Batch processing
   - Idempotent updates (safe to re-run)
   - Links external data to CanonicalCompany

4. **CareerPageMonitoringService** (`app/services/CareerPageMonitoringService.ts`)
   - Career page change detection (placeholder - requires HTTP client)
   - Scheduled monitoring
   - Signal updates on changes

### API Endpoints

#### Company Enrichment
- `POST /api/companies/enrich` - Enrich single or batch companies
- `GET /api/companies/intent` - Get companies with intent filters
- `PUT /api/companies/intent` - Recalculate intent scores
- `GET /api/companies/leaderboard` - High hiring intent leaderboard
- `GET /api/companies/export` - CSV export for sales
- `GET /api/companies/[companyId]` - Get company enrichment details
- `PATCH /api/companies/[companyId]` - Update enrichment (sales notes, pitch target)
- `POST /api/companies/monitor` - Trigger career page monitoring

## Scoring Algorithm

### Signal Weights

- Career page exists: +30 points
- Keyword matches: +10 points each (capped at 30)
- ACTIVE external status: +20 points
- Jobs posted in last 7 days: +40 points (max)
- Jobs posted in last 30 days: +20 points (max, non-overlapping with 7d)
- Multiple job categories: +10 points

### Intent Levels

- **VERY_HIGH**: Score >= 100
- **HIGH**: Score >= 70
- **MEDIUM**: Score >= 40
- **LOW**: Score < 40

## Usage

### 1. Enrich Companies from JSON Files

```bash
# Enrich from TechBehemoths data
tsx scripts/enrich-companies-from-json.ts utils/results.json techbehemoths

# Enrich from RamroJob data
tsx scripts/enrich-companies-from-json.ts utils/ramrojob_companies.json ramrojob

# Enrich from Virit data
tsx scripts/enrich-companies-from-json.ts utils/virit-jobs.json virit

# Enrich from MeroJob data
tsx scripts/enrich-companies-from-json.ts utils/mero-job.json merojob

# Enrich from WorkHub data
tsx scripts/enrich-companies-from-json.ts utils/workhub.json workhub
```

### 2. API Usage Examples

#### Enrich a single company
```bash
curl -X POST http://localhost:3000/api/companies/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "name": "F1Soft International",
    "website": "https://f1soft.com",
    "email": "hr@f1soft.com",
    "careerPageUrl": "https://f1soft.com/careers",
    "status": "ACTIVE",
    "keywordMatches": ["career", "join our team"],
    "source": "manual"
  }'
```

#### Get high-intent companies
```bash
curl "http://localhost:3000/api/companies/intent?level=HIGH&minScore=70&hasContact=true&limit=20"
```

#### Get leaderboard
```bash
curl "http://localhost:3000/api/companies/leaderboard?type=intent&limit=20"
```

#### Export to CSV
```bash
curl "http://localhost:3000/api/companies/export?type=high-intent" -o companies.csv
```

#### Update sales notes
```bash
curl -X PATCH http://localhost:3000/api/companies/[companyId] \
  -H "Content-Type: application/json" \
  -d '{
    "salesNotes": "Contacted on 2024-01-15. Interested in premium listing.",
    "isPitchTarget": true
  }'
```

## Matching Logic

### Confidence Levels

1. **HIGH (94-100% similarity)**: Auto-link to existing company
2. **MEDIUM (80-93% similarity)**: Flag for admin review
3. **LOW (<80% similarity)**: Create new lead company

### Matching Strategies (in order)

1. **Domain Match**: Exact domain match from website URL
2. **Exact Name Match**: Normalized company name (case-insensitive, punctuation removed)
3. **Fuzzy Match**: String similarity using Levenshtein distance (string-similarity library)
4. **Alias Match**: Check against company aliases

## Safety & Ethics

### Implemented Safeguards

1. **No Auto-Emailing**: System only stores contact info. No automated outreach.
2. **Data Source Tracking**: Every enrichment tracks its source (ExternalSource enum)
3. **Trust Scores**: Source reliability tracking (0.0-1.0)
4. **Verification Metadata**: Last verified timestamp
5. **Manual Override**: Sales notes and pitch target flags require manual action
6. **Idempotency**: Safe to re-run enrichment on same data

### Future Considerations

- Respect robots.txt (for career page monitoring)
- Rate limiting for external API calls
- GDPR compliance for contact data
- Consent tracking for outreach
- Data retention policies

## Database Schema

### company_enrichments

- `id` (UUID, PK)
- `companyId` (UUID, FK to canonical_companies)
- Contact fields: `email`, `phoneNumber`, `website`, `careerPageUrl`
- Signals: `hasCareerPage`, `keywordMatches[]`, `externalStatus`
- Job activity: `jobsLast7Days`, `jobsLast30Days`, `uniqueJobCategories`
- Intent: `intentScore`, `intentLevel`
- Matching: `matchConfidence`, `matchSimilarity`, `matchedBy`, `source`
- Sales: `isPitchTarget`, `isNewLead`, `salesNotes`
- Metadata: `trustScore`, `lastVerifiedAt`, `lastCheckedAt`

### hiring_intent_score_history

- `id` (UUID, PK)
- `enrichmentId` (UUID, FK)
- `score` (int)
- `level` (enum)
- `signalBreakdown` (JSONB)
- `trigger` (text)
- `recordedAt` (timestamp)

## Extension Points

### Adding New External Sources

1. Add source to `ExternalSource` enum in `CompanyEnrichment.ts`
2. Update source mapping in `enrich-companies-from-json.ts`
3. Transform source data to `ExternalCompanyData` format
4. Run enrichment script

### Future Integrations

- **Google Maps API**: Company location enrichment
- **LinkedIn API**: Company profile data, employee count
- **Clearbit API**: Company data enrichment
- **Hunter.io**: Email verification
- **ZoomInfo**: B2B contact data

### Career Page Monitoring Implementation

Currently a placeholder. To implement:

1. Add HTTP client (axios/fetch)
2. Add HTML parser (cheerio for static, puppeteer for JS-rendered)
3. Implement job count detection (CSS selectors, patterns)
4. Add change detection logic
5. Set up scheduled job (cron, queue worker)

Example structure:
```typescript
const response = await fetch(enrichment.careerPageUrl);
const html = await response.text();
const $ = cheerio.load(html);
const jobCount = $('.job-listing, .job-post').length;
```

## Testing

### Manual Testing Steps

1. **Test Matching**:
   - Create test companies in database
   - Run enrichment with similar names
   - Verify match confidence levels

2. **Test Scoring**:
   - Enrich companies with different signal combinations
   - Verify score calculations
   - Check score history

3. **Test APIs**:
   - Test all endpoints with various filters
   - Verify CSV export format
   - Test pagination

4. **Test Batch Processing**:
   - Run enrichment script on JSON files
   - Verify duplicate handling
   - Check error reporting

## Performance Considerations

- **Batch Processing**: Use batch enrichment for large datasets
- **Indexing**: Key fields are indexed (companyId, intentScore, intentLevel)
- **Query Optimization**: Use query builder for complex filters
- **Caching**: Consider caching for leaderboard queries
- **Background Jobs**: Use queue workers for bulk operations

## Next Steps

1. **Database Migration**: Create migration for new tables
2. **Admin Dashboard UI**: Build React components for company enrichment views
3. **Career Page Monitoring**: Implement HTTP client + HTML parsing
4. **Scheduled Jobs**: Set up cron/queue for monitoring
5. **Email Integration**: Add email verification service
6. **Analytics**: Track enrichment success rates, match quality
7. **A/B Testing**: Test different scoring weights
8. **Machine Learning**: Consider ML for match confidence

