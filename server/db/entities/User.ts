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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
