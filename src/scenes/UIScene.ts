import Phaser from 'phaser';
import { VirtualJoystick } from '../ui/VirtualJoystick';

export class UIScene extends Phaser.Scene {
    private joystick!: VirtualJoystick;
    private hospitalScene!: Phaser.Scene;

    constructor() {
        super('UIScene');
    }

    create() {
        this.hospitalScene = this.scene.get('Hospital');

        // Add Joystick at bottom left
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.joystick = new VirtualJoystick(this, 150, height - 150);
        this.add.existing(this.joystick);

        // Add Action Button (Interact)
        this.add.rectangle(width - 150, height - 150, 100, 100, 0x00ff00, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.hospitalScene.events.emit('action_interact');
            });
        this.add.text(width - 150, height - 150, 'A', { fontSize: '48px' }).setOrigin(0.5);
    }

    update() {
        if (this.joystick && this.hospitalScene) {
            this.hospitalScene.events.emit('joystick_move', this.joystick.joyVector);
        }
    }
}
