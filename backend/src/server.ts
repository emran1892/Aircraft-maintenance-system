import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import "reflect-metadata";
import { AppDataSource } from './config/data-source';
import authRouter from "./modules/auth/auth.routes";
import aircraftRouter from "./modules/aircrafts/aircraft.routes";
import discrepancyRouter from "./modules/discrepancies/discrepancy.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/aircrafts", aircraftRouter);
app.use("/api/discrepancies", discrepancyRouter);


app.get('/', (req, res) => {
    res.send('Aircraft Maintenance System API is Running Successfully! ✈️');
});

AppDataSource.initialize()
    .then(() => {
        console.log("📊 Database connected successfully!");
        app.listen(PORT, () => {
            console.log(`🚀 Server is flying high on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Error during Database initialization:", error);
    });