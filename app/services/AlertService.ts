import { AnalyticsService } from "./AnalyticsService";

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
}

export class AlertService {
  // Check for anomalies and generate alerts
  // In a real system, this would trigger emails/Slack messages
  static async checkSystemHealth(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const overview = await AnalyticsService.getExecutiveOverview();

    // 1. Check Scraper Health (Jobs Added Today)
    // If it's late in the day (e.g. > 10 AM) and 0 jobs added, that's suspicious
    const now = new Date();
    const hour = now.getHours(); // Local server time

    if (hour > 10 && overview.jobsToday.value === 0) {
      alerts.push({
        id: "no-jobs-today",
        type: "critical",
        title: "No Jobs Scraped Today",
        message: "It is past 10 AM and 0 jobs have been added. Scraper might be broken.",
        timestamp: now,
      });
    }

    // 2. Check Data Quality (Completeness)
    if (overview.completenessScore < 70) {
      alerts.push({
        id: "low-data-quality",
        type: "warning",
        title: "Data Quality Degradation",
        message: `Completeness score has dropped to ${overview.completenessScore}%. Check scraper parsing logic.`,
        timestamp: now,
      });
    }

    // 3. Expiring Jobs Spike (e.g. if > 50% of active jobs are expiring tomorrow, that's an issue)
    // (Simplified check)
    if (overview.expiredJobs > overview.activeJobs * 2) {
      alerts.push({
        id: "high-expiry-rate",
        type: "info",
        title: "High Expiry Rate",
        message: `There are 2x more expired jobs than active ones. Run cleanup or verify expiry logic.`,
        timestamp: now,
      });
    }

    return alerts;
  }
}
