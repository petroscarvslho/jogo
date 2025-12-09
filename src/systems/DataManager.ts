import { Patient, Item, ItemCategory } from '../entities/GameData';

export class DataManager {
    private static instance: DataManager;
    private patients: Patient[] = [];
    private items: Item[] = [];

    private constructor() { }

    public static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    public async loadData(): Promise<void> {
        try {
            // Load Patients
            const patientsResponse = await fetch('/data/patients.json?url');
            this.patients = await patientsResponse.json();

            // Load Items
            const itemsResponse = await fetch('/data/items_anestesia.json?url');
            this.items = await itemsResponse.json();

            console.log(`DataManager: Loaded ${this.patients.length} patients and ${this.items.length} items.`);
        } catch (error) {
            console.error('DataManager: Failed to load data', error);
        }
    }

    public getRandomPatient(): Patient {
        if (this.patients.length === 0) {
            throw new Error('No patients loaded');
        }
        const index = Math.floor(Math.random() * this.patients.length);
        return this.patients[index];
    }

    public getItemsByCategory(category: ItemCategory): Item[] {
        return this.items.filter(item => item.category === category);
    }

    public getAllItems(): Item[] {
        return this.items;
    }

    public getItemById(id: string): Item | undefined {
        return this.items.find(item => item.id === id);
    }
}
