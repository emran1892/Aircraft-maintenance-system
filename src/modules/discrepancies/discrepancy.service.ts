import { AppDataSource } from "../../config/data-source";
import { Discrepancy, DiscrepancyStatus } from "./discrepancy.entity";
import { Aircraft, AircraftStatus } from "../aircrafts/aircraft.entity";
import { User, UserRole } from "../users/user.entity";

export const createDiscrepancyService = async (
    title: string,
    description: string,
    aircraftId: string,
    checkerId: string,
    duration_required: string
) => {
    const discrepancyRepository = AppDataSource.getRepository(Discrepancy);
    const aircraftRepository = AppDataSource.getRepository(Aircraft);
    const userRepository = AppDataSource.getRepository(User);

    //1.check if the aircraft exists in the system
    const aircraft = await aircraftRepository.findOne({ where: { id: aircraftId } });
    if (!aircraft) {
        throw new Error("Aircraft not found!");
    }

    // 2. check if the checker user exists in the system
    const checker = await userRepository.findOne({ where: { id: checkerId } });
    if (!checker) {
        throw new Error("Reporter/Checker user not found!");
    }

    // 3. New discrepancy
    const newDiscrepancy = discrepancyRepository.create({
        title,
        description,
        aircraft,
        reportedBy: checker,
        duration_required // Default value, can be updated later by engineer or admin
    });

    // 4. Update the aircraft status to AOG (Aircraft on Ground) when a new discrepancy is reported
    aircraft.status = AircraftStatus.AOG;
    await aircraftRepository.save(aircraft);

    // 5. Save the discrepancy to the database and return it
    return await discrepancyRepository.save(newDiscrepancy);
};

//-----------------------------------------------------------------------------------------------------------

export const getAllDiscrepanciesService = async () => {
    const discrepancyRepository = AppDataSource.getRepository(Discrepancy);

    // relational all data with aircraft, reportedBy and assignedTo
    return await discrepancyRepository.find({
        relations: {
            aircraft: true,
            reportedBy: true,
            assignedTo: true,
        }
    });
};


//-----------------------------------------------------------------------------------------------------------

export const assignOrClaimTaskService = async (discrepancyId: string, engineerId: string) => {
    const discrepancyRepository = AppDataSource.getRepository(Discrepancy);
    const userRepository = AppDataSource.getRepository(User);

    // 1. Find the discrepancy card
    const discrepancy = await discrepancyRepository.findOne({
        where: { id: discrepancyId },
        relations: { aircraft: true } // We need the aircraft relation to verify its state later
    });
    if (!discrepancy) {
        throw new Error("Discrepancy card not found!");
    }

    // 2. Check if the task is already taken by someone else
    if (discrepancy.status !== DiscrepancyStatus.OPEN) {
        throw new Error("This task has already been claimed or is currently in progress!");
    }

    // 3. Verify if the target engineer exists in the database
    const engineer = await userRepository.findOne({ where: { id: engineerId, role: UserRole.ENGINEER } });
    if (!engineer) {
        throw new Error("Assignee must be a valid registered Engineer!");
    }

    // 4. Update the card status and assign the engineer
    discrepancy.status = DiscrepancyStatus.IN_PROGRESS;
    discrepancy.assignedTo = engineer;

    // 5. Save the updated card back to the database
    return await discrepancyRepository.save(discrepancy);
};



//-----------------------------------------------------------------------------------------------------------

export const resolveDiscrepancyService = async (discrepancyId: string, engineerId: string) => {
    const discrepancyRepository = AppDataSource.getRepository(Discrepancy);
    const aircraftRepository = AppDataSource.getRepository(Aircraft);

    // 1. Find the discrepancy card with its related aircraft
    const discrepancy = await discrepancyRepository.findOne({
        where: { id: discrepancyId },
        relations: { aircraft: true, assignedTo: true }
    });

    if (!discrepancy) {
        throw new Error("Discrepancy card not found!");
    }

    // 2. Security Check: Ensure ONLY the engineer assigned to this task can resolve it
    if (!discrepancy.assignedTo || discrepancy.assignedTo.id !== engineerId) {
        throw new Error("Access denied! You cannot resolve a task that is not assigned to you.");
    }

    // 3. Check if it's already resolved
    if (discrepancy.status === DiscrepancyStatus.RESOLVED) {
        throw new Error("This discrepancy has already been resolved!");
    }

    // 4. Update the task status to RESOLVED
    discrepancy.status = DiscrepancyStatus.RESOLVED;
    await discrepancyRepository.save(discrepancy);

    // 5. THE MAGIC PART: Automatically change the aircraft status back to fully_serviceable
    const aircraft = discrepancy.aircraft;
    aircraft.status = AircraftStatus.SERVICEABLE;
    await aircraftRepository.save(aircraft);

    return {
        discrepancy,
        aircraft_status: aircraft.status
    };
};