
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from "typeorm";

@Entity("canonical_locations")
export class CanonicalLocation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", unique: true })
    @Index()
    name: string; // e.g., "Kathmandu"

    @Column({ type: "text", array: true, default: [] })
    aliases: string[]; // e.g., ["KTM", "Kathmandu Valley", "Ktm."]

    @Column({ type: "varchar", default: "city" })
    type: "city" | "region" | "country";

    @CreateDateColumn()
    createdAt: Date;
}
