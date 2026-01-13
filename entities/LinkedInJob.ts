import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("linkedin_jobs")
export class LinkedInJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, unique: true })
  @Index()
  job_id: string;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text", nullable: true })
  company: string;

  @Column({ type: "text", nullable: true })
  company_link: string;

  @Column({ type: "text", nullable: true })
  place: string;

  @Column({ type: "date", nullable: true })
  @Index()
  job_date: Date;

  @Column({ type: "text", nullable: true })
  job_link: string;

  @Column({ type: "text", nullable: true })
  apply_link: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  insights: Record<string, any>;

  @CreateDateColumn()
  @Index()
  created_at: Date;
}

