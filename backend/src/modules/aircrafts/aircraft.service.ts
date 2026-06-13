import { AppDataSource } from "../../config/data-source";
import { Aircraft, AircraftStatus } from "./aircraft.entity";

export const createAircraftService = async (aircraftData: any) => {
    const aircraftRepository = AppDataSource.getRepository(Aircraft);
    const { name, model, registration_number, status } = aircraftData;

    const existingAircraft = await aircraftRepository.findOne({ where: { registration_number } });
    if (existingAircraft) {
        throw new Error("Registration number already exists for another aircraft!");
    }

    const newAircraft = aircraftRepository.create({ name, model, registration_number, status });
    return await aircraftRepository.save(newAircraft);
};

// 1. Get All Service 
export const getAllAircraftsService = async () => {
    const aircraftRepository = AppDataSource.getRepository(Aircraft);
    return await aircraftRepository.find();
};

// 2. Get By ID Service 
export const getAircraftByIdService = async (id: string) => {
    const aircraftRepository = AppDataSource.getRepository(Aircraft);
    const aircraft = await aircraftRepository.findOne({ where: { id } });

    if (!aircraft) {
        throw new Error("Aircraft not found!");
    }
    return aircraft;
};

// 3. Update Status Service
export const updateAircraftStatusService = async (id: string, newStatus: AircraftStatus) => {
    const aircraftRepository = AppDataSource.getRepository(Aircraft);

    // find the aircraft by ID
    const aircraft = await aircraftRepository.findOne({ where: { id } });
    if (!aircraft) {
        throw new Error("Aircraft not found!");
    }

    // update the status
    aircraft.status = newStatus;

    // save to the database and return
    return await aircraftRepository.save(aircraft);
};