import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { HiringIntentLevel } from "./CompanyEnrichment";

@Entity("hiring_intent_score_history")
export class HiringIntentScoreHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  @Index()
  enrichmentId: string;

  @ManyToOne(
    () => {
      // Dynamic import to avoid circular dependency
      const { CompanyEnrichment } = require("./CompanyEnrichment");
      return CompanyEnrichment;
    },
    (enrichment: any) => enrichment.scoreHistory,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "enrichmentId" })
  enrichment: any;

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

