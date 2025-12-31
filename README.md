# 🇳🇵 Nepal Job Scraper & Aggregator SaaS

A fullstack Next.js application that scrapes and aggregates job listings from major Nepali job portals into one centralized platform.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Scraping:** Cheerio + Axios
- **Authentication:** NextAuth.js (Credentials Provider)
- **Styling:** TailwindCSS + Shadcn UI
- **Icons:** Lucide React

## 📋 Features

### ✨ Core Features
- **Job Scraping** from major Nepal job portals:
  - MeroCareer.com
  - JobsNepal.com
  - KumariJob.com
  - KantipurJob.com
  - RamroJob.com
  - InternSathi.com (Internships & Jobs)
  - JobAxle.com (Internships & Jobs)
  
- **Internship Scraping** from popular platforms:
  - InternSathi.com
  - JobAxle.com
  - More platforms coming soon...

- **Job Aggregation:** All jobs stored in PostgreSQL with deduplication
- **Beautiful UI:** Modern, responsive interface built with Shadcn UI
- **Search & Filter:** Browse jobs by source, location, category
- **Job Details:** Detailed view for each job posting
- **Admin Dashboard:** Protected dashboard to trigger scrapers
- **Authentication:** Secure login with NextAuth

### 🔮 Coming Soon (Post-MVP)
- Automated cron job scheduling
- Redis caching for faster performance
- Email/Telegram job alerts
- Advanced search with filters
- SEO optimization for "Nepal Jobs" keywords
- Billing integration (Khalti/eSewa)

## 📁 Project Structure

```
job-finder/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   └── register/route.ts         # User registration
│   │   ├── jobs/
│   │   │   ├── [id]/route.ts            # Single job CRUD
│   │   │   └── route.ts                  # Jobs list API
│   │   ├── scrape/
│   │   │   └── run/route.ts             # Scraper trigger
│   │   └── stats/route.ts                # Statistics API
│   ├── dashboard/
│   │   └── page.tsx                      # Admin dashboard
│   ├── jobs/
│   │   └── [id]/page.tsx                # Job detail page
│   ├── login/
│   │   └── page.tsx                      # Login page
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Homepage
│   └── globals.css                       # Global styles
├── components/
│   ├── ui/                               # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   ├── JobCard.tsx                       # Job card component
│   ├── Navbar.tsx                        # Navigation bar
│   └── Providers.tsx                     # Session provider
├── entities/
│   ├── Job.ts                            # Job entity (TypeORM)
│   └── User.ts                           # User entity (TypeORM)
├── lib/
│   ├── scrapers/                         # Individual scrapers
│   │   ├── merojob.ts
│   │   ├── kantipurjob.ts
│   │   ├── jobsnepal.ts
│   │   ├── merocareer.ts
│   │   ├── ramrojob.ts
│   │   ├── globaljobnepal.ts
│   │   └── kumarijob.ts
│   ├── scraper-runner.ts                 # Orchestrator
│   ├── db.ts                             # Database connection
│   ├── auth.ts                           # NextAuth config
│   ├── types.ts                          # TypeScript types
│   └── utils.ts                          # Utility functions
├── types/
│   └── next-auth.d.ts                    # NextAuth type definitions
├── .env.example                          # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- npm or yarn package manager

### 1. Clone & Install

```bash
# Navigate to your project directory
cd job-finder

# Install dependencies
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nepal_jobs;

# Exit psql
\q
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nepal_jobs

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-generate-random-string

# App URL
NEXT_PUBLIC_API=http://localhost:3000
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Create Admin User

Since this is the first setup, you'll need to create an admin user manually:

**Option 1: Using the API**

After starting the server, send a POST request:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Option 2: Using PostgreSQL directly**

```sql
-- After running the app once (which creates tables)
-- Hash for 'admin123': $2a$10$...
INSERT INTO "user" (email, password, role, "createdAt")
VALUES ('admin@example.com', '$2a$10$YourHashedPasswordHere', 'admin', NOW());
```

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 🎯 Usage Guide

### For Users (Job Seekers)

1. **Browse Jobs:** Visit the homepage to see all aggregated jobs
2. **View Details:** Click on any job card to see full details
3. **Apply:** Click "Apply" to be redirected to the original job posting

### For Admins

1. **Login:** Navigate to `/login`
   - Default credentials: `admin@example.com` / `admin123`

2. **Dashboard:** Access `/dashboard` after logging in

3. **Run Scraper:**
   - Click "Run Scraper Now" button
   - Wait for the process to complete (30-60 seconds)
   - View statistics showing jobs scraped

4. **Monitor Stats:**
   - Total jobs in database
   - Jobs by source
   - Recent scraping results

## 🔧 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs (supports `?source=merojob`, `?limit=50`, `?offset=0`) |
| GET | `/api/jobs/:id` | Get single job details |
| GET | `/api/stats` | Get statistics (total jobs, by source) |

### Protected Endpoints (Require Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape/run` | Trigger job scraper |
| DELETE | `/api/jobs/:id` | Delete a job |
| POST | `/api/auth/register` | Register new user |

### Example API Calls

**Get all jobs:**
```bash
curl http://localhost:3000/api/jobs
```

**Get jobs from specific source:**
```bash
curl http://localhost:3000/api/jobs?source=merojob&limit=20
```

**Get statistics:**
```bash
curl http://localhost:3000/api/stats
```

**Trigger scraper (requires auth token):**
```bash
curl -X POST http://localhost:3000/api/scrape/run \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

## 🤖 Automated Scraping (GitHub Actions)

The scraper can run automatically using GitHub Actions on a daily schedule.

### Setup GitHub Actions Workflow

1. **Add Secrets to GitHub (Optional):**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add `API_URL` secret only if you want to override the default URL (default: `https://kamkhoj.eventeir.ai`)

2. **Workflow File:**
   - `.github/workflows/daily-scraper-api.yml` - Calls your deployed API endpoint (recommended)
   - `.github/workflows/daily-scraper.yml` - Runs scraper script directly (alternative, requires DATABASE_URL)

The workflow runs daily at midnight UTC and calls your deployed API at `https://kamkhoj.eventeir.ai/api/scrape/run`.

### Manual Trigger

```bash
# Via GitHub CLI
gh workflow run "Daily Job Scraper"

# Or trigger from GitHub Actions UI:
# 1. Go to Actions tab
# 2. Select "Daily Job Scraper"
# 3. Click "Run workflow"
```

### Test the API Endpoint

```bash
curl -X POST https://kamkhoj.eventeir.ai/api/scrape/run \
  -H "Content-Type: application/json"
```

## 🗃️ Database Schema

### Job Entity

```typescript
{
  id: number;              // Primary key
  title: string;           // Job title
  company: string;         // Company name
  location: string;        // Job location
  url: string;             // Original job URL (unique)
  source: string;          // Source portal name
  category?: string;       // Job category
  description?: string;    // Job description
  postedDate?: string;     // When posted
  createdAt: Date;         // When scraped
  updatedAt: Date;         // Last updated
}
```

### User Entity

```typescript
{
  id: number;              // Primary key
  email: string;           // Unique email
  password: string;        // Hashed password
  role: string;            // User role (admin/user)
  createdAt: Date;         // Registration date
}
```

## 🕷️ How Scraping Works

### Scraper Architecture

1. **Individual Scrapers** (`lib/scrapers/*.ts`):
   - Each portal has its own scraper module
   - Uses Axios to fetch HTML
   - Uses Cheerio to parse DOM
   - Validates data with Zod schema
   - Returns standardized job objects

2. **Orchestrator** (`lib/scraper-runner.ts`):
   - Runs all scrapers in parallel
   - Handles errors gracefully
   - Aggregates results

3. **API Handler** (`app/api/scrape/run/route.ts`):
   - Triggers scraper runner
   - Saves jobs to database
   - Handles duplicates (by URL)
   - Returns statistics

### Adding a New Scraper

1. Create a new file in `lib/scrapers/`:

```typescript
// lib/scrapers/newsite.ts
import axios from "axios";
import * as cheerio from "cheerio";
import { JobResult, JobSchema } from "@/lib/types";

export async function scrapeNewSite(): Promise<JobResult[]> {
  try {
    const { data } = await axios.get("https://newsite.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const jobs: JobResult[] = [];

    $(".job-selector").each((_, element) => {
      const title = $(element).find(".title").text().trim();
      const company = $(element).find(".company").text().trim();
      const location = $(element).find(".location").text().trim();
      const url = $(element).find("a").attr("href");

      if (title && company && url) {
        const result = JobSchema.safeParse({
          title,
          company,
          location,
          url: url.startsWith("http") ? url : `https://newsite.com${url}`,
          source: "newsite",
        });

        if (result.success) {
          jobs.push(result.data);
        }
      }
    });

    return jobs;
  } catch (error) {
    console.error("NewSite scraping failed:", error);
    return [];
  }
}
```

2. Add to `lib/scraper-runner.ts`:

```typescript
import { scrapeNewSite } from "./scrapers/newsite";

export async function runAllScrapers() {
  const scraperPromises = [
    // ... existing scrapers
    scrapeNewSite(),
  ];
  // ... rest of code
}
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

**Important:** Set up a managed PostgreSQL database (Vercel Postgres, Supabase, or Railway)

### Deploy to Other Platforms

Works on any platform supporting Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## 🔐 Security Notes

- Passwords are hashed with bcrypt
- NextAuth handles session management
- Environment variables never committed
- Database credentials kept secure
- CORS configured for API routes
- SQL injection prevented by TypeORM

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Verify credentials
psql -U postgres -d nepal_jobs
```

### TypeORM Errors

```bash
# Clear TypeORM cache
rm -rf .next
npm run dev
```

### Scraping Failures

- Check if target websites are accessible
- Some sites may block automated requests
- Adjust User-Agent headers if needed
- Check for website structure changes

### Build Errors

```bash
# Clear all caches
rm -rf .next node_modules
npm install
npm run build
```

## 📈 Performance Tips

1. **Enable caching** for API routes (Redis recommended)
2. **Use pagination** for large job lists
3. **Implement rate limiting** on scraper endpoints
4. **Add indexes** on frequently queried fields
5. **Use CDN** for static assets

## 🎨 Customization

### Branding

Update `app/layout.tsx` for site title and meta tags:

```typescript
export const metadata: Metadata = {
  title: "Your Job Site Name",
  description: "Your description",
};
```

### Styling

- Modify `app/globals.css` for global styles
- Update `tailwind.config.ts` for theme colors
- Customize Shadcn components in `components/ui/`

### Adding Features

1. **Email Notifications:** Integrate with SendGrid/Resend
2. **Telegram Alerts:** Use Telegram Bot API
3. **Advanced Search:** Add Elasticsearch
4. **Job Recommendations:** Implement ML algorithms

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💡 Future Enhancements

- [ ] Automated daily scraping with cron jobs
- [ ] Email alerts for new jobs
- [ ] Job search with filters (salary, experience, etc.)
- [ ] User profiles and saved jobs
- [ ] Company profiles
- [ ] Application tracking
- [ ] Resume builder
- [ ] Mobile app (React Native)
- [ ] SEO optimization
- [ ] Analytics dashboard

## 📞 Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review troubleshooting section

## 🙏 Acknowledgments

Built with:
- Next.js team for the amazing framework
- Shadcn for beautiful UI components
- Nepal job portals for providing job data

---

**Made with ❤️ for Nepal's job seekers**

# Get all job URLs
GET /api/kamkhoj/data/all

# Get URLs from a specific source
GET /api/kamkhoj/data/all?source=necojobs

# Get only internship URLs
GET /api/kamkhoj/data/all?type=internship

# Combine filters
GET /api/kamkhoj/data/all?source=internsathi&type=internship