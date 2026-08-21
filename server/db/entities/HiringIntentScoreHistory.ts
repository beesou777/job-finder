import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { HiringIntentLevel } from "./CompanyEnrichment";

@Entity("hiring_intent_score_history")
export class HiringIntentScoreHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  enrichmentId: string;

  @Column({ type: "int" })
  score: number;

  @Column({ type: "enum", enum: HiringIntentLevel })
  level: HiringIntentLevel;

  @Column({ type: "jsonb", nullable: true })
  signalBreakdown: {
    careerPage?: number;
    keywordMatches?: number;
    externalStatus?: number;
    jobsLast7Days?: number;
    jobsLast30Days?: number;
    uniqueCategories?: number;
  };

  @Column({ type: "text", nullable: true })
  trigger: string; // What caused the score change

  @CreateDateColumn()
  @Index()
  recordedAt: Date;
}
