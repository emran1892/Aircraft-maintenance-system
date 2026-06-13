import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";


// .env lodding env file 
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true, //  true for development, atomateically sync database schema, false for production
    logging: false,    // true whene want to see SQL queries in console
    entities: [__dirname + "/../modules/**/*.entity.{ts,js}"], // all entities will be in modules folder
    migrations: [],
    subscribers: [],
});