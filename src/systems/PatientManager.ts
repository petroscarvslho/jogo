import { DataManager } from '../systems/DataManager';
import { Patient } from '../entities/GameData';

export class PatientManager {
    private currentPatient: Patient | null = null;
    private static instance: PatientManager;

    private constructor() { }

    public static getInstance(): PatientManager {
        if (!PatientManager.instance) {
            PatientManager.instance = new PatientManager();
        }
        return PatientManager.instance;
    }

    public startNewCase(): Patient {
        const dataManager = DataManager.getInstance();
        this.currentPatient = dataManager.getRandomPatient();
        console.log(`PatientManager: Starting case for ${this.currentPatient.id}`);
        return this.currentPatient;
    }

    public getCurrentPatient(): Patient | null {
        return this.currentPatient;
    }

    public endCase() {
        this.currentPatient = null;
    }
}
