import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { CanonicalCompany } from "./CanonicalCompany";

export enum HiringIntentLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  VERY_HIGH = "VERY_HIGH",
}

export enum ExternalSource {
  TECHBEHEMOTHS = "techbehemoths",
  RAMROJOB = "ramrojob",
  MEROJOB = "merojob",
  VIRIT = "virit",
  WORKHUB = "workhub",
  MANUAL = "manual",
  GOOGLE = "google",
  LINKEDIN = "linkedin",
}

export enum MatchConfidence {
  HIGH = "HIGH", // 94-100% similarity - auto-link
  MEDIUM = "MEDIUM", // 80-93% similarity - admin review
  LOW = "LOW", // <80% similarity - new lead
}

@Entity("company_enrichments")
export class CompanyEnrichment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", unique: true })
  @Index()
  companyId: string; // FK to CanonicalCompany

  @ManyToOne(() => CanonicalCompany, { onDelete: "CASCADE" })
  @JoinColumn({ name: "companyId" })
  company: CanonicalCompany;

  // Contact Information
  @Column({ type: "varchar", nullable: true })
  email: string;

  @Column({ type: "varchar", nullable: true })
  phoneNumber: string;

  @Column({ type: "varchar", nullable: true })
  website: string;

  @Column({ type: "text", nullable: true })
  careerPageUrl: string;

  @Column({ type: "text", nullable: true })
  externalProfileUrl: string; // e.g., TechBehemoths profile

  // Hiring Signals
  @Column({ type: "boolean", default: false })
  hasCareerPage: boolean;

  @Column({ type: "text", array: true, default: [] })
  keywordMatches: string[]; // e.g., ["career", "join our team", "vacancy"]

  @Column({ type: "varchar", nullable: true })
  externalStatus: string; // e.g., "ACTIVE", "NO_CAREER_PAGE", "UNKNOWN"

  // Job Activity Signals (calculated from Job table)
  @Column({ type: "int", default: 0 })
  jobsLast7Days: number;

  @Column({ type: "int", default: 0 })
  jobsLast30Days: number;

  @Column({ type: "int", default: 0 })
  uniqueJobCategories: number;

  // Hiring Intent Score
  @Column({ type: "int", default: 0 })
  @Index()
  intentScore: number; // 0-150

  @Column({ type: "enum", enum: HiringIntentLevel, default: HiringIntentLevel.LOW })
  @Index()
  intentLevel: HiringIntentLevel;

  // Matching Metadata
  @Column({ type: "enum", enum: MatchConfidence, nullable: true })
  matchConfidence: MatchConfidence;

  @Column({ type: "float", nullable: true })
  matchSimilarity: number; // 0-100

  @Column({ type: "varchar", nullable: true })
  matchedBy: string; // "name", "domain", "fuzzy"

  // External Source Tracking
  @Column({ type: "enum", enum: ExternalSource, nullable: true })
  @Index()
  source: ExternalSource;

  @Column({ type: "float", default: 1.0 })
  trustScore: number; // 0.0-1.0, reliability of source

  @Column({ type: "timestamp", nullable: true })
  lastVerifiedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastCheckedAt: Date; // Career page last checked

  // Sales & Outreach
  @Column({ type: "text", nullable: true })
  salesNotes: string; // Manual notes for sales team

  @Column({ type: "boolean", default: false })
  @Index()
  isNewLead: boolean; // Company not in CanonicalCompany table

  @Column({ type: "boolean", default: false })
  @Index()
  isPitchTarget: boolean; // Flagged for sales outreach

  // History tracking (using lazy function to avoid circular dependency)
  @OneToMany(
    () => {
      // Dynamic import to avoid circular dependency
      const { HiringIntentScoreHistory } = require("./HiringIntentScoreHistory");
      return HiringIntentScoreHistory;
    },
    (history: any) => history.enrichment,
    { cascade: true }
  )
  scoreHistory: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
