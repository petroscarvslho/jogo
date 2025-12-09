export interface Patient {
    id: string;
    name?: string; // Optional, can be generated
    age: number;
    weight: number; // kg
    asa_class: 'I' | 'II' | 'III' | 'IV' | 'V' | 'E';
    comorbidities: string[];
    surgery_type: string;
    urgency: 'elective' | 'urgency' | 'emergency';
}

export type ItemCategory =
    | 'hypnotic'
    | 'opioid'
    | 'neuromuscular_blocker'
    | 'vasopressor'
    | 'local_anesthetic'
    | 'airway_material'
    | 'epidural_material'
    | 'antibiotic'
    | 'other';

export interface Item {
    id: string;
    name: string;
    category: ItemCategory;
    subtype: string; // e.g., 'ampoule', 'syringe'
    dose_unit: string; // mg, mcg, mL
    concentration: string; // e.g. "10 mg/mL"
    route: string[]; // e.g. ["IV", "IM"]
    is_critical: boolean;
    cost?: number; // Gamification element
}

export interface GameData {
    patients: Patient[];
    items: Item[];
}

export type MissionState = 'IDLE' | 'RECEIVED' | 'PREPPING' | 'SURGERY' | 'COMPLETED';

export interface Mission {
    id: string;
    title: string; // e.g., "C-Section Room 3"
    description: string; // "Patient Maria, 32w, urgent C-Section."
    patientId: string; // Link to patient data
    requiredItems: string[]; // IDs of items needed
    reward: number;
}
