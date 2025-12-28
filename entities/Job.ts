import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from "typeorm";
import { Category } from "./Category";

export enum JobTypeEnum {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
  CONTRACT = "contract",
  REMOTE = "remote",
  HYBRID = "hybrid",
  ONSITE = "onsite",
  FREELANCE = "freelance",
  TEMPORARY = "temporary",
  INTERNSHIP = "internship",
}

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", unique: true })
  @Index()
  applyUrl: string;

  @Column({ type: "varchar", nullable: true })
  company: string;

  @Column({ type: "varchar", nullable: true })
  location: string;

  @Column({ type: "varchar", nullable: true, default: "Negotiable" })
  salaryText: string;

  @Column({ type: "varchar", nullable: true })
  deadline: string;

  @Column({ type: "timestamp", nullable: true })
  @Index()
  expiresAt: Date;

  @Column({
    type: "varchar",
    nullable: true,
  })
  @Index()
  jobType: JobTypeEnum | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Column({ type: "uuid", nullable: true })
  @Index()
  categoryId: string;

  // Keep old category field for migration purposes (will be removed later)
  @Column({ type: "varchar", nullable: true })
  @Index()
  categoryOld: string;

  @Column({ type: "varchar", default: "job" })
  @Index()
  type: "job" | "internship";

  @Column({ type: "varchar", default: "unknown" })
  @Index()
  source: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  requirements: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Index()
  postedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

