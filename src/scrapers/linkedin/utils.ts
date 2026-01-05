
import { JobData, detectJobType } from '../../core/types';

export function parseRelativeDate(relativeTime: string): Date {
    const now = new Date();
    const cleanTime = relativeTime.toLowerCase().trim();

    if (cleanTime.includes('minute')) {
        const minutes = parseInt(cleanTime) || 0;
        now.setMinutes(now.getMinutes() - minutes);
    } else if (cleanTime.includes('hour')) {
        const hours = parseInt(cleanTime) || 0;
        now.setHours(now.getHours() - hours);
    } else if (cleanTime.includes('day')) {
        const days = parseInt(cleanTime) || 0;
        now.setDate(now.getDate() - days);
    } else if (cleanTime.includes('week')) {
        const weeks = parseInt(cleanTime) || 0;
        now.setDate(now.getDate() - (weeks * 7));
    } else if (cleanTime.includes('month')) {
        const months = parseInt(cleanTime) || 0;
        now.setMonth(now.getMonth() - months);
    }

    return now;
}

export function cleanText(text?: string | null): string {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes job data to fit the project's JobData schema
 */
export function normalizeJobData(raw: any, source: string): JobData {
    const title = cleanText(raw.title);
    const company = cleanText(raw.company);
    const description = raw.description || '';

    const type = detectJobType(title, raw.url || '', raw.criteria?.['Employment type']);

    return {
        title: title,
        company: company,
        location: cleanText(raw.location),
        applyUrl: raw.url || raw.applyUrl,
        source: source,
        type: type, // "job" or "internship"
        description: description,
        jobType: raw.criteria?.['Employment type'] || undefined, // Full-time, etc.
        category: raw.criteria?.['Industries'] || undefined,
        // salaryText: undefined, // Usually not available publicly easily
        // deadline: undefined,
        // requirements: undefined, 
        // expiresAt: // Handle in upper layer or let default
    };
}
