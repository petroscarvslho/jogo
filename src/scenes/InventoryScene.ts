import Phaser from 'phaser';
import { DataManager } from '../systems/DataManager';
import { InventoryManager } from '../systems/InventoryManager';
import { ItemCategory } from '../entities/GameData';

export class InventoryScene extends Phaser.Scene {
    private categories: ItemCategory[] = ['hypnotic', 'opioid', 'neuromuscular_blocker', 'vasopressor', 'airway_material'];
    private currentCategoryIndex: number = 0;
    private itemListContainer!: Phaser.GameObjects.Container;
    private isBattle: boolean = false;

    constructor() {
        super('InventoryScene');
    }

    init(data: { isBattle?: boolean }) {
        this.isBattle = data.isBattle || false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);

        // Title
        this.add.text(width / 2, 50, this.isBattle ? 'USAR ITEM' : 'FARMÁCIA / KIT', { fontSize: '48px', color: '#fff' }).setOrigin(0.5);

        // Category Tabs (Hide or Simplify in Battle? Keep for now)
        this.createCategoryTabs();

        // Item List
        this.itemListContainer = this.add.container(0, 200);
        this.showItems(this.categories[0]);

        // Close Button
        this.add.text(width / 2, height - 100, 'VOLTAR', {
            fontSize: '40px',
            backgroundColor: '#00aa00',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.stop();
            if (this.isBattle) {
                this.scene.resume('SurgeryScene');
            } else {
                this.scene.resume('Hospital');
            }
        });
    }

    createCategoryTabs() {
        let x = 50;
        const y = 120;

        this.categories.forEach((cat, index) => {
            this.add.text(x, y, cat.toUpperCase().slice(0, 3), {
                fontSize: '24px',
                backgroundColor: index === this.currentCategoryIndex ? '#ffffff' : '#333333',
                color: index === this.currentCategoryIndex ? '#000000' : '#ffffff',
                padding: { x: 10, y: 5 }
            }).setInteractive().on('pointerdown', () => {
                this.currentCategoryIndex = index;
                // Restart with same data
                this.scene.restart({ isBattle: this.isBattle });
            });
            x += 120;
        });
    }

    showItems(category: ItemCategory) {
        const items = DataManager.getInstance().getItemsByCategory(category);
        const invManager = InventoryManager.getInstance();

        let y = 0;
        items.forEach(item => {
            const hasItem = invManager.hasItem(item.id);

            // In Battle: Only show items we HAVE
            if (this.isBattle && !hasItem) return;

            const isSelected = hasItem; // Visual logic for Kit Mode
            const color = (this.isBattle) ? '#ffffff' : (isSelected ? '#00ff00' : '#ffffff');
            const prefix = this.isBattle ? '> ' : (isSelected ? '[X] ' : '[ ] ');

            const itemText = this.add.text(50, y, `${prefix} ${item.name}`, {
                fontSize: '32px',
                color: color
            }).setInteractive().on('pointerdown', () => {
                if (this.isBattle) {
                    // USE ITEM
                    console.log(`Using item: ${item.name}`);
                    this.events.emit('item_used', item);
                    this.scene.stop();
                    this.scene.resume('SurgeryScene');
                } else {
                    // TOGGLE ITEM (Kit Mode)
                    if (isSelected) {
                        invManager.removeItem(item);
                    } else {
                        invManager.addItem(item);
                    }
                    // Refresh visuals
                    itemText.setText(`${!isSelected ? '[X] ' : '[ ] '} ${item.name}`);
                    itemText.setColor(!isSelected ? '#00ff00' : '#ffffff');
                }
            });

            this.itemListContainer.add(itemText);
            y += 60;
        });
    }
}
