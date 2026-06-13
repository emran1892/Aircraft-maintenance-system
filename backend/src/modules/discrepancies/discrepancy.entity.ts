import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Aircraft } from "../aircrafts/aircraft.entity";
import { User } from "../users/user.entity";

// fixed discrepancy status options
export enum DiscrepancyStatus {
    OPEN = "open",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved"
}

@Entity("discrepancies")
export class Discrepancy {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text" })
    title!: string; // Brief name of the discrepancy (e.g., "Right Wing Fuel Leak")

    @Column({ type: "text" })
    description!: string; // Details about the problem

    @Column({
        type: "enum",
        enum: DiscrepancyStatus,
        default: DiscrepancyStatus.OPEN
    })
    status!: DiscrepancyStatus;

    // ==========================================
    // RELATIONSHIPS 
    // ==========================================

    // কোন এয়ারক্রাফটে সমস্যা হয়েছে (ManyToOne)
    @ManyToOne(() => Aircraft, { onDelete: "CASCADE" })
    @JoinColumn({ name: "aircraft_id" })
    aircraft!: Aircraft;

    // কোন চেকার এটি রিপোর্ট করেছেন (ManyToOne)
    @ManyToOne(() => User, { onDelete: "SET NULL" })
    @JoinColumn({ name: "reported_by" })
    reportedBy!: User;

    @Column({ type: "varchar", length: 50, nullable: true })
    duration_required!: string; // e.g., "4 hours", "12 hours", "2 days"

    // কোন ইঞ্জিনিয়ার এই কাজটি করছেন (শুরুতে এটি ফাকা বা null থাকবে)
    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "assigned_to" })
    assignedTo!: User | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}