import Phaser from 'phaser';
import { MissionManager } from '../systems/MissionManager';
export class Hospital extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };

    constructor() {
        super('Hospital');
    }

    create() {
        // 1. Map Generation
        const floor = this.add.group();

        // 1. Lobby (Start) - 0 to 10 width, 0-10 height
        // 1. Lobby (Start) - Clean White/Grey
        this.createRoom(floor, 0, 0, 10, 10, 0xf0f0f0);
        // 2. Connector Hallway
        this.createRoom(floor, 10, 4, 4, 3, 0xffffff);
        // 3. OR (Operation Room) - Surgical Blue/Green
        this.createRoom(floor, 14, 0, 10, 10, 0xe0f7fa);
        // 4. Pharmacy - Clinical White
        this.createRoom(floor, 0, 12, 8, 6, 0xffffff);
        // 5. PACU (Recovery) - Warm White
        this.createRoom(floor, 14, 12, 10, 6, 0xfffde7);

        this.physics.world.setBounds(0, 0, 30 * 32, 20 * 32);

        // 2. Player
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10); // Player on top of floor

        // 3. Decorations (Dream Hospital Vibe)
        // Note: Frame indices are guesses based on standard tileset layouts. 
        // We will adjust them after seeing the visual result.

        // Lobby: Reception Area
        this.add.image(4 * 32, 4 * 32, 'desk_reception').setDepth(5).setScale(1.5);
        this.add.image(2 * 32, 6 * 32, 'desk_reception').setDepth(5); // Placeholder chair

        // OR: Surgical Suite
        // Operating Table (Center)
        this.add.image(19 * 32, 5 * 32, 'table_op').setDepth(5).setScale(2);
        // Anesthesia Machine (Head)
        this.add.image(18 * 32, 5 * 32, 'machine_anest').setDepth(5).setScale(1.5);

        // Pharmacy & PACU
        // Medicine Cabinets (Placeholder using machine for now, need specific cabinet)
        this.add.image(2 * 32, 14 * 32, 'machine_anest').setDepth(5);

        // PACU: Recovery Beds
        this.add.image(16 * 32, 15 * 32, 'bed_patient').setDepth(5);
        this.add.image(18 * 32, 15 * 32, 'bed_patient').setDepth(5);
        this.add.image(20 * 32, 15 * 32, 'bed_patient').setDepth(5);

        // 4. Camera config
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2); // Zoom in for pixel art look

        // 4. Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as any;
        }

        // Launch UI
        this.scene.launch('UIScene');

        // Listen to Joystick
        this.events.on('joystick_move', (vector: Phaser.Math.Vector2) => {
            if (vector.lengthSq() > 0.01) {
                this.handleJoystickMove(vector);
            } else if (!this.input.keyboard?.checkDown(this.cursors.left) &&
                !this.input.keyboard?.checkDown(this.cursors.right) &&
                !this.input.keyboard?.checkDown(this.cursors.up) &&
                !this.input.keyboard?.checkDown(this.cursors.down)) {
            }
        });

        // Surgeon NPC (The "Enemy" Trainer)
        const surgeon = this.physics.add.sprite(19 * 32, 5 * 32, 'surgeon'); // Placeholder sprite
        // surgeon.setTint(0x0000ff); // Removed tint, using real sprite
        surgeon.setScale(2); // Pixel art might be small

        // Exclamation Mark (Hidden initially)
        const exclamation = this.add.text(19 * 32, 4 * 32, '!', {
            fontSize: '32px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.addInteractionZone(19 * 32, 5 * 32, 'Cirurgião', () => {
            // Only start surgery if we have a mission!
            const missionState = MissionManager.getInstance().getState();
            if (missionState === 'RECEIVED' || missionState === 'PREPPING') {
                this.startSurgerySequence(exclamation);
            } else {
                this.showDialog("Cirurgião: 'Não temos cirurgias agora. Vá falar com a enfermeira na recepção.'");
            }
        });

        // Nurse NPC (Reception)
        const nurse = this.physics.add.sprite(4 * 32, 4 * 32, 'nurse');
        // nurse.setTint(0xff69b4); // Removed tint
        nurse.setScale(2);

        this.addInteractionZone(4 * 32, 4 * 32, 'Enfermeira Chefe', () => {
            const mm = MissionManager.getInstance();
            if (mm.getState() === 'IDLE') {
                this.showDialog("Enfermeira: 'Dr(a), corre! Cesárea de emergência na Sala 1!'");
                mm.startMission('c_section_01');
            } else {
                this.showDialog(`Enfermeira: 'O que faz aqui? Vá para a sala! ${mm.getCurrentMission()?.title}'`);
            }
        });

        // Listen to Interact
        this.events.on('action_interact', () => {
            console.log('Interact pressed within Hospital');
            const currentZone = this.registry.get('currentZone');
            if (currentZone && currentZone.callback) {
                console.log(`Interacting with ${currentZone.label}`);
                currentZone.callback();
            } else {
                console.log('Nothing to interact with');
            }
        });

        // UI instructions
        this.add.text(10, 10, 'WASD/Setas para mover', { font: '16px monospace', color: '#000' })
            .setScrollFactor(0);
    }

    createRoom(group: Phaser.GameObjects.Group, x: number, y: number, w: number, h: number, color: number) {
        for (let i = x; i < x + w; i++) {
            for (let j = y; j < y + h; j++) {
                const tile = this.add.image(i * 32, j * 32, 'tile_floor').setOrigin(0);
                tile.setTint(color);
                group.add(tile);
            }
        }
    }

    addInteractionZone(x: number, y: number, label: string, callback: () => void) {
        const zone = this.add.zone(x, y, 64, 64);
        this.physics.world.enable(zone);
        const body = zone.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.moves = false;

        // Visual Debug
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffff00);
        graphics.strokeRect(x - 32, y - 32, 64, 64);

        this.physics.add.overlap(this.player, zone, () => {
            this.registry.set('currentZone', { label, callback });
        });
    }

    startSurgerySequence(exclamation: Phaser.GameObjects.Text) {
        console.log("Surgeon Encounter!");
        this.input.enabled = false;
        this.player.body?.stop();

        exclamation.setVisible(true);
        this.tweens.add({
            targets: exclamation,
            y: exclamation.y - 10,
            duration: 200,
            yoyo: true,
            repeat: 3,

            onComplete: () => {
                this.cameras.main.flash(1000, 255, 255, 255, true, (_cam: any, progress: number) => {
                    if (progress === 1) {
                        MissionManager.getInstance().setState('SURGERY');
                        this.scene.switch('SurgeryScene');
                        this.input.enabled = true;
                        exclamation.setVisible(false);
                    }
                });
            }
        });
    }

    showDialog(text: string) {
        // Simple overlay text for MVP dialog
        // In a real RPG, this would pause game and show a box
        const dialogBox = this.add.rectangle(this.cameras.main.scrollX + 540, this.cameras.main.scrollY + 1700, 1000, 200, 0x000000, 0.9).setScrollFactor(0);
        const dialogText = this.add.text(this.cameras.main.scrollX + 60, this.cameras.main.scrollY + 1620, text, {
            fontSize: '32px', color: '#fff', wordWrap: { width: 900 }
        }).setScrollFactor(0);

        // Auto hide after 3s
        this.time.delayedCall(3000, () => {
            dialogBox.destroy();
            dialogText.destroy();
        });
    }

    handleJoystickMove(vector: Phaser.Math.Vector2) {
        if (!this.player) return;
        const speed = 200;
        this.player.body?.velocity.set(vector.x * speed, vector.y * speed);
    }

    update() {
        if (!this.player) return;

        const speed = 200;
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        // Only reset if no input from joystick (we can track a "joyActive" flag)
        // For simplicity, let's prioritize Keyboard, if Keyboard is idle, check Joystick logic (driven by event)
        // Actually, force reset to 0 every frame for Keyboard logic, Joystick event overrides it? 
        // Better: Update Check

        let velX = 0;
        let velY = 0;

        // Keyboard
        if (this.cursors.left.isDown || this.wasd.left.isDown) velX = -speed;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) velX = speed;

        if (this.cursors.up.isDown || this.wasd.up.isDown) velY = -speed;
        else if (this.cursors.down.isDown || this.wasd.down.isDown) velY = speed;

        // Apply Keyboard first
        if (velX !== 0 || velY !== 0) {
            body.setVelocity(velX, velY);
        } else {
            // If keyboard idle, we rely on joystick calls which set velocity directly
            // But we need to drag (stop) if joystick is also 0?
            // The joystick event sets velocity. If we reset here, we fight it.
            // Quick fix: Set drag or check a timestamp of last joystick event.
            // Simplest: Don't setVelocity(0) here if we want joystick to persist.
            // BUT usually we want instant stop.
            // Let's modify handleJoystickMove to set a flag 'isJoystickMoving'
            // And reset it here.
            body.setDrag(1000); // Add drag so it stops naturally if no input
        }
    }
}
