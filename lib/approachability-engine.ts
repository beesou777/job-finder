import "reflect-metadata";
import { getDataSource } from "@/lib/db";
import { CompanyEnrichment, ApproachabilityLevel } from "@/entities/CompanyEnrichment";
import { Job } from "@/entities/Job";
import { LinkedInJob } from "@/entities/LinkedInJob";
import { CanonicalCompany } from "@/entities/CanonicalCompany";

/**
 * Approachability Engine
 * 
 * Calculates an outreach opportunity score (0-100) for companies.
 * High Score = High opportunity for sales outreach.
 */
export async function computeApproachabilityForCompany(companyId: string) {
    const dataSource = await getDataSource();
    const enrichmentRepo = dataSource.getRepository(CompanyEnrichment);
    const jobRepo = dataSource.getRepository(Job);
    const linkedinRepo = dataSource.getRepository(LinkedInJob);
    const companyRepo = dataSource.getRepository(CanonicalCompany);

    const enrichment = await enrichmentRepo.findOne({
        where: { companyId },
        relations: ["company"]
    });

    if (!enrichment) return null;

    const company = enrichment.company;
    const companyName = company.name;

    let score = 0;

    // 1. Check for Native Jobs (KamKhoj source)
    const nativeJobsCount = await jobRepo.count({
        where: {
            company: companyName,
            source: "kamkhoj"
        }
    });

    if (nativeJobsCount > 0) {
        // If they already post native jobs, they are a low outreach target
        score -= 100;
    } else {
        // 2. Check for Scraped Jobs
        const scrapedJobsCount = await jobRepo.count({
            where: {
                company: companyName
            }
            // Note: In Job table, if source isn't kamkhoj, it's scraped
        });

        // We already know nativeJobsCount is 0 here
        if (scrapedJobsCount > 0) {
            score += 40;
        }

        // 3. Check for LinkedIn Jobs
        const linkedinJobsCount = await linkedinRepo.count({
            where: {
                company: companyName
            }
        });

        if (linkedinJobsCount > 0) {
            score += 50;
        }
    }

    // 4. Enrichment Signals
    if (enrichment.hasCareerPage || enrichment.careerPageUrl) {
        score += 15;
    }

    if (enrichment.email || enrichment.phoneNumber) {
        score += 10;
    }

    // Clamp score between 0 and 100
    const finalScore = Math.max(0, Math.min(100, score));

    // Determine Level
    let level = ApproachabilityLevel.LOW;
    if (finalScore >= 70) {
        level = ApproachabilityLevel.HIGH;
    } else if (finalScore >= 30) {
        level = ApproachabilityLevel.MEDIUM;
    }

    // Update Enrichment
    enrichment.approachabilityScore = finalScore;
    enrichment.approachabilityLevel = level;
    enrichment.approachabilityLastComputed = new Date();

    await enrichmentRepo.save(enrichment);

    return { score: finalScore, level };
}

/**
 * Bulk compute for all companies that haven't been computed recently
 */
export async function bulkComputeApproachability(force = false) {
    const dataSource = await getDataSource();
    const enrichmentRepo = dataSource.getRepository(CompanyEnrichment);

    const query = enrichmentRepo.createQueryBuilder("enrichment");

    if (!force) {
        // Recompute if older than 7 days or never computed
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query.where("enrichment.approachabilityLastComputed IS NULL OR enrichment.approachabilityLastComputed < :sevenDaysAgo", { sevenDaysAgo });
    }

    const enrichments = await query.getMany();
    console.log(`[Approachability] Computing for ${enrichments.length} companies...`);

    const results = [];
    for (const enrichment of enrichments) {
        try {
            const res = await computeApproachabilityForCompany(enrichment.companyId);
            results.push({ id: enrichment.companyId, ...res });
        } catch (err) {
            console.error(`Failed to compute for ${enrichment.companyId}:`, err);
        }
    }

    return results;
}
