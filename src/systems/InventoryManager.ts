import { Item } from '../entities/GameData';

export class InventoryManager {
    private static instance: InventoryManager;
    private selectedItems: Item[] = [];

    private constructor() { }

    public static getInstance(): InventoryManager {
        if (!InventoryManager.instance) {
            InventoryManager.instance = new InventoryManager();
        }
        return InventoryManager.instance;
    }

    public addItem(item: Item) {
        // Check duplicates if needed, or allow multiples?
        // For MVP, allow multiples (e.g. 2 ampoules of propofol)
        this.selectedItems.push(item);
        console.log(`Inventory: Added ${item.name}`);
    }

    public removeItem(item: Item) {
        const index = this.selectedItems.indexOf(item);
        if (index > -1) {
            this.selectedItems.splice(index, 1);
        }
    }

    public getSelectedItems(): Item[] {
        return this.selectedItems;
    }

    public clearInventory() {
        this.selectedItems = [];
    }

    public hasItem(itemId: string): boolean {
        return this.selectedItems.some(i => i.id === itemId);
    }
}
