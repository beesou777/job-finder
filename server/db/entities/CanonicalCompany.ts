import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from "typeorm";

@Entity("canonical_companies")
export class CanonicalCompany {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  @Index()
  name: string; // e.g., "F1Soft International"

  @Column({ type: "text", array: true, default: [] })
  aliases: string[]; // e.g., ["F1Soft", "f1soft", "F1 Soft"]

  @Column({ type: "varchar", nullable: true })
  domain: string; // e.g., "f1soft.com"

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
