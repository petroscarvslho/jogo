import { Mission, MissionState } from "../entities/GameData";
import { DataManager } from "./DataManager";

export class MissionManager {
    private static instance: MissionManager;

    private currentMission: Mission | null = null;
    private state: MissionState = 'IDLE';

    private constructor() { }

    public static getInstance(): MissionManager {
        if (!MissionManager.instance) {
            MissionManager.instance = new MissionManager();
        }
        return MissionManager.instance;
    }

    startMission(missionId: string) {
        // For MVP, we hardcode or fetch. Let's create a dummy mission if generic.
        if (missionId === 'c_section_01') {
            this.currentMission = {
                id: 'c_section_01',
                title: 'Cesárea de Emergência',
                description: 'Gestante, 32 anos. Sofrimento fetal agudo. Sala 1.',
                patientId: 'pt_maria', // We need to ensure this matches a patient in JSON or generate one
                requiredItems: ['bupivacaina', 'efedrina'],
                reward: 100
            };
            this.state = 'RECEIVED';
            console.log(`Mission Started: ${this.currentMission.title}`);
        }
    }

    getCurrentMission(): Mission | null {
        return this.currentMission;
    }

    getState(): MissionState {
        return this.state;
    }

    setState(newState: MissionState) {
        this.state = newState;
        console.log(`Mission State: ${this.state}`);
    }

    completeMission() {
        this.state = 'COMPLETED';
        this.currentMission = null;
    }
}
