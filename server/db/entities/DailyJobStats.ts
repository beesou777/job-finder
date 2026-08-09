
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from "typeorm";

@Entity("daily_job_stats")
export class DailyJobStats {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "date" })
    @Index({ unique: true })
    date: string; // YYYY-MM-DD

    @Column({ type: "int", default: 0 })
    totalJobs: number;

    @Column({ type: "int", default: 0 })
    activeJobs: number;

    @Column({ type: "int", default: 0 })
    expiredJobs: number;

    @Column({ type: "int", default: 0 })
    newJobsAdded: number; // Jobs created on this specific date

    @Column({ type: "int", default: 0 })
    jobsExpiringSoon: number; // within 7 days

    @CreateDateColumn()
    computedAt: Date;
}
