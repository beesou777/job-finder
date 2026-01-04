
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { DailyJobStats } from "@/entities/DailyJobStats";
import { DailySourceStats } from "@/entities/DailySourceStats";
import { Between, IsNull, LessThanOrEqual, MoreThan } from "typeorm";
import { startOfDay, endOfDay, subDays, addDays, format } from "date-fns";

export class SnapshotService {

    // Generate snapshot for a specific date
    // Usually run by a nightly cron job for the previous day
    static async generateSnapshot(dateStr: string) {
        const dataSource = await getDataSource();
        const jobRepo = dataSource.getRepository(Job);
        const statsRepo = dataSource.getRepository(DailyJobStats);
        const sourceStatsRepo = dataSource.getRepository(DailySourceStats);

        const targetDate = new Date(dateStr);
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        console.log(`Generating snapshot for ${dateStr}...`);

        // 1. Compute DailyJobStats
        const newJobsAdded = await jobRepo.count({
            where: { createdAt: Between(start, end) }
        });

        const activeJobsAtEnd = await jobRepo.count({
            where: [
                { expiresAt: IsNull(), createdAt: LessThanOrEqual(end) },
                { expiresAt: MoreThan(end), createdAt: LessThanOrEqual(end) }
            ]
        });

        const expiredJobsAtEnd = await jobRepo.count({
            where: { expiresAt: LessThanOrEqual(end) }
        });

        const totalJobsAtEnd = activeJobsAtEnd + expiredJobsAtEnd;

        // Save to DB (Update if exists)
        let dailyStat = await statsRepo.findOne({ where: { date: dateStr } });
        if (!dailyStat) {
            dailyStat = new DailyJobStats();
            dailyStat.date = dateStr;
        }

        dailyStat.newJobsAdded = newJobsAdded;
        dailyStat.activeJobs = activeJobsAtEnd;
        dailyStat.expiredJobs = expiredJobsAtEnd;
        dailyStat.totalJobs = totalJobsAtEnd;

        await statsRepo.save(dailyStat);

        // 2. Compute DailySourceStats (Breakdown)
        // Group by source for jobs active on that day or added on that day? 
        // Let's track jobs ADDED on that day per source for volume trends
        const sourceBreakdown = await jobRepo.createQueryBuilder("job")
            .select("job.source", "source")
            .addSelect("COUNT(*)", "count")
            .where("job.createdAt BETWEEN :start AND :end", { start, end })
            .groupBy("job.source")
            .getRawMany();

        for (const item of sourceBreakdown) {
            let sourceStat = await sourceStatsRepo.findOne({
                where: { date: dateStr, source: item.source }
            });

            if (!sourceStat) {
                sourceStat = new DailySourceStats();
                sourceStat.date = dateStr;
                sourceStat.source = item.source;
            }

            sourceStat.jobCount = parseInt(item.count, 10);
            await sourceStatsRepo.save(sourceStat);
        }

        console.log(`Snapshot for ${dateStr} completed.`);
        return dailyStat;
    }

    // Backfill script helper
    static async backfill(days = 30) {
        const today = new Date();
        for (let i = 1; i <= days; i++) {
            const d = subDays(today, i);
            const dateStr = format(d, "yyyy-MM-dd");
            await this.generateSnapshot(dateStr);
        }
    }
}
