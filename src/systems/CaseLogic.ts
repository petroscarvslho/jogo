export enum CasePhase {
    PRE_OP = 'Pre-Op',
    INDUCTION = 'Induction',
    MAINTENANCE = 'Maintenance',
    EMERGENCE = 'Emergence',
    RECOVERY = 'Recovery'
}

export interface SurgeryCase {
    id: string;
    patientId: string;
    surgeryName: string;
    description: string;
    requiredDrugs: string[];
    complexity: number; // 1-5
    phaseDuration: { // in seconds (mock)
        induction: number;
        maintenance: number;
    };
}

// Logic to be integrated into SurgeryScene
// if (currentPhase === INDUCTION && vitals.hypnosis > 80 && vitals.muscleRelax > 80) -> Ready to Intubate
// if (currentPhase === MAINTENANCE) -> Surgical Stimulus Events (Pain) -> Vital Changes
