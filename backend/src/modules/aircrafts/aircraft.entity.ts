import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

// Aviation standard status for aircraft
export enum AircraftStatus {
    SERVICEABLE = "fully_serviceable",
    AOG = "aog"
}

@Entity("aircrafts") // Database table name will be 'aircrafts'
export class Aircraft {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 100 })
    name!: string; // e.g., "Boeing 737-800"

    @Column({ type: "varchar", length: 50 })
    model!: string; // e.g., "B738"

    @Column({ type: "varchar", length: 20, unique: true })
    registration_number!: string; // e.g., "S2-AHV", must be unique for each aircraft

    @Column({
        type: "enum",
        enum: AircraftStatus,
        default: AircraftStatus.SERVICEABLE
    })
    status!: AircraftStatus; // default is "fully_serviceable"


    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;


}