
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from "typeorm";

@Entity("daily_source_stats")
export class DailySourceStats {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "date" })
    @Index()
    date: string; // YYYY-MM-DD

    @Column({ type: "varchar" })
    @Index()
    source: string;

    @Column({ type: "int", default: 0 })
    jobCount: number;

    @Column({ type: "float", default: 0 })
    completenessScore: number;

    @CreateDateColumn()
    computedAt: Date;
}
