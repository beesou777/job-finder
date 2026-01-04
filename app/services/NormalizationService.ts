
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { CanonicalLocation } from "@/entities/CanonicalLocation";
import { CanonicalCompany } from "@/entities/CanonicalCompany";

export class NormalizationService {

    // Suggest Location Mappings based on frequency
    static async suggestLocationMappings() {
        const dataSource = await getDataSource();
        const jobRepo = dataSource.getRepository(Job);

        // Find locations that are NOT yet normalized (this logic assumes we might add a 'canonicalLocationId' to Job later, 
        // but for now we look for strings that don't match canonical names)

        const rawLocations = await jobRepo.createQueryBuilder("job")
            .select("job.location", "rawName")
            .addSelect("COUNT(*)", "count")
            .where("job.location IS NOT NULL")
            .groupBy("job.location")
            .orderBy("count", "DESC")
            .limit(100)
            .getRawMany();

        return rawLocations;
    }

    // Normalize a single location string (Simple lookup for now)
    static async normalizeLocation(rawInput: string): Promise<string | null> {
        // In a real implementation, this would:
        // 1. Check exact match against CanonicalLocation.name
        // 2. Check alias match
        // 3. Use fuzzy matching or Levenshtein distance

        const lowerInput = rawInput.toLowerCase().trim();

        // Hardcoded rules for demonstration (until DB populated)
        if (lowerInput.includes("kathmandu") || lowerInput === "ktm" || lowerInput === "ktm.") {
            return "Kathmandu";
        }
        if (lowerInput.includes("lalitpur")) {
            return "Lalitpur";
        }
        if (lowerInput.includes("bhaktapur")) {
            return "Bhaktapur";
        }
        if (lowerInput.includes("pokhara")) {
            return "Pokhara";
        }

        return null; // No confident match
    }

    static async getUnverifiedCompanies() {
        const dataSource = await getDataSource();
        const jobRepo = dataSource.getRepository(Job);

        const rawCompanies = await jobRepo.createQueryBuilder("job")
            .select("job.company", "rawName")
            .addSelect("COUNT(*)", "count")
            .where("job.company IS NOT NULL")
            .groupBy("job.company")
            .orderBy("count", "DESC")
            .limit(50)
            .getRawMany();

        return rawCompanies;
    }
}
