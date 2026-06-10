import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

// ইউজার রোল ডিফাইন করার জন্য একটি Enum (নির্দিষ্ট কিছু অপশন)
export enum UserRole {
    ADMIN = "admin",
    ENGINEER = "engineer"
}

@Entity("users") // table name in database 'users'
export class User {
    @PrimaryGeneratedColumn("uuid") //ato-generated unique identifier, uuid format
    id!: string;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "varchar", unique: true }) // no same email allowed, unique constraint
    email!: string;

    @Column({ type: "varchar" })
    password!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.ENGINEER // when new user created, default role will be engineer
    })
    role!: UserRole;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}