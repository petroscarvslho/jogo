import Phaser from 'phaser';
import { DataManager } from '../systems/DataManager';

export class Preload extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    preload() {
        this.load.setPath('assets');

        // Real Assets
        this.load.image('player', 'characters/player.png'); // Doctor
        this.load.image('doctor', 'characters/doctor.png');
        this.load.image('nurse', 'characters/nurse.png');
        this.load.image('surgeon', 'characters/surgeon.png');
        this.load.image('patient', 'characters/patient.png');

        // Prop Sheets (Dream Hospital Style)
        // this.load.spritesheet('hospital_props', 'tileset/hospital_sheet.png', { frameWidth: 32, frameHeight: 32 }); // Broken

        // Individual Objects (Safer)
        this.load.image('table_op', 'objects/table_op.png');
        this.load.image('machine_anest', 'objects/machine_anest.png');
        this.load.image('desk_reception', 'objects/desk_reception.png');
        this.load.image('bed_patient', 'objects/bed_patient.png');

        this.load.spritesheet('icons', 'ui/icons.png', { frameWidth: 32, frameHeight: 32 });

        // Tileset (We need to slice this or use as image for now)
        // For MVP, since we built the map with 'tile_floor', let's stick to generating placeholders 
        // for tiles unless we implement a real Tilemap. 
        // ACTUALLY, let's load the hospital tileset and use a part of it or just keep the placeholder floor for now 
        // to avoid breaking the map layout logic which uses single-tile images.
        // Better strategy: Load the character sprites, keep tile placeholders for safe map generation until Tilemap is implemented.

        // Loading Bar Logic
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Carregando...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load Data
        // We use a custom async load for data since it uses fetch
        // But for now, we trigger it in create
    }

    async create() {
        // Generate Placeholders ONLY for things we didn't load
        this.generateEnvironmentPlaceholders();
        this.generateItemIcons();

        // Load Game Data
        await DataManager.getInstance().loadData();

        this.scene.start('MainMenu');
    }

    generateEnvironmentPlaceholders() {
        // 1. Procedural Operating Room Tile (32x32)
        if (!this.textures.exists('tile_floor')) {
            const floor = this.make.graphics({ x: 0, y: 0 } as any);

            // Base: Clean Blue-White
            floor.fillStyle(0xdfe6e9, 1);
            floor.fillRect(0, 0, 32, 32);

            // Inner Square (Ceramic look)
            floor.fillStyle(0xcbd5e1, 1);
            floor.fillRect(1, 1, 30, 30);

            // Highlight
            floor.fillStyle(0xffffff, 0.5);
            floor.fillRect(1, 1, 30, 1);
            floor.fillRect(1, 1, 1, 30);

            floor.generateTexture('tile_floor', 32, 32);
        }

        // 2. Procedural Bed + Patient (64x128 approx, but we scale it)
        // We generate a "sprite" look
        if (!this.textures.exists('bed_patient')) {
            const bed = this.make.graphics({ x: 0, y: 0 } as any);

            // Bed Sheet (Blue)
            bed.fillStyle(0x3498db, 1);
            bed.fillRoundedRect(0, 20, 60, 100, 5);

            // Pillow (White)
            bed.fillStyle(0xffffff, 1);
            bed.fillRect(5, 5, 50, 20);

            // Patient Head (Flesh tone)
            bed.fillStyle(0xffccaa, 1);
            bed.fillCircle(30, 25, 12);

            // Patient Body outline under sheet (Darker Blue)
            bed.fillStyle(0x2980b9, 1);
            bed.fillRoundedRect(10, 40, 40, 70, 10);

            bed.generateTexture('bed_patient', 64, 130);
        }

        // 3. Wall Tile (Darker Grey/Blue)
        if (!this.textures.exists('tile_wall')) {
            const wall = this.make.graphics({ x: 0, y: 0 } as any);
            wall.fillStyle(0x34495e, 1);
            wall.fillRect(0, 0, 32, 32);
            // Border
            wall.lineStyle(2, 0x2c3e50);
            wall.strokeRect(0, 0, 32, 32);
            wall.generateTexture('tile_wall', 32, 32);
        }

        // Joystick Placeholders (Keep simple)
        if (!this.textures.exists('joy_base')) {
            const joyBase = this.make.graphics({ x: 0, y: 0 } as any);
            joyBase.fillStyle(0x888888, 0.5);
            joyBase.fillCircle(50, 50, 50);
            joyBase.generateTexture('joy_base', 100, 100);
        }
        if (!this.textures.exists('joy_thumb')) {
            const joyThumb = this.make.graphics({ x: 0, y: 0 } as any);
            joyThumb.fillStyle(0xcccccc, 0.8);
            joyThumb.fillCircle(25, 25, 25);
            joyThumb.generateTexture('joy_thumb', 50, 50);
        }
    }

    generateItemIcons() {
        // 1. Syringe Icon
        if (!this.textures.exists('icon_syringe')) {
            const g = this.make.graphics({ x: 0, y: 0 } as any);
            g.fillStyle(0xecf0f1, 1); // Barrel
            g.fillRect(12, 10, 8, 14);
            g.lineStyle(2, 0xbdc3c7);
            g.strokeRect(12, 10, 8, 14);

            g.fillStyle(0x3498db, 1); // Liquid
            g.fillRect(13, 15, 6, 8);

            g.fillStyle(0x95a5a6, 1); // Needle
            g.fillRect(15, 2, 2, 8);

            g.fillStyle(0xecf0f1, 1); // Plunger
            g.fillRect(10, 24, 12, 4);
            g.fillRect(15, 24, 2, 6);

            g.generateTexture('icon_syringe', 32, 32);
        }

        // 2. Tube Icon (Intubation)
        if (!this.textures.exists('icon_tube')) {
            const g = this.make.graphics({ x: 0, y: 0 } as any);
            g.lineStyle(3, 0xffffff, 1);
            g.beginPath();
            g.moveTo(6, 6);
            g.lineTo(12, 6);
            g.lineTo(26, 26); // Angular tube (safer for TS)
            g.strokePath();

            g.lineStyle(2, 0x3498db, 1); // Cuff
            g.strokeRect(22, 22, 6, 4);

            g.generateTexture('icon_tube', 32, 32);
        }

        // 3. Mask Icon (Ventilation)
        if (!this.textures.exists('icon_mask')) {
            const g = this.make.graphics({ x: 0, y: 0 } as any);
            g.fillStyle(0x2ecc71, 0.5); // Mask Green
            g.fillTriangle(16, 6, 6, 26, 26, 26);
            g.lineStyle(2, 0x27ae60);
            g.strokeTriangle(16, 6, 6, 26, 26, 26);

            g.generateTexture('icon_mask', 32, 32);
        }
    }
}
