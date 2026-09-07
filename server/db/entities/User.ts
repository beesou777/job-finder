import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "varchar", default: "user" })
  role: string;

  @Column({ type: "varchar", nullable: true })
  preferredRole: string | null;

  @Column({ type: "jsonb", default: () => "'[]'" })
  preferredKeywords: string[];

  @Column({ type: "varchar", nullable: true })
  preferredLocation: string | null;

  @Column({ type: "varchar", nullable: true })
  preferredJobType: string | null;

  @Column({ type: "varchar", nullable: true })
  preferredWorkMode: string | null;

  @Column({ type: "boolean", default: true })
  emailAlerts: boolean;

  @Column({ type: "jsonb", default: () => "'[]'" })
  savedJobIds: string[];

  @Column({ type: "text", nullable: true })
  cvUrl: string | null;

  @Column({ type: "text", nullable: true })
  cvKey: string | null;

  @Column({ type: "text", nullable: true })
  cvFilename: string | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  cvUploadedAt: Date | null;

  @Column({ type: "text", nullable: true })
  cvRole: string | null;

  @Column({ type: "jsonb", default: () => "'[]'" })
  cvSkills: string[];

  @Column({ type: "text", nullable: true })
  cvSummary: string | null;

  @Column({ type: "text", nullable: true })
  cvExperienceLevel: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
