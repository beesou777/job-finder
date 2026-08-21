import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from "typeorm";
import { Job } from "./Job";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  @Index()
  name: string;

  @Column({ type: "varchar", nullable: true })
  slug: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Job, (job) => job.category)
  jobs: Job[];
}
