import Phaser from 'phaser';

export class VirtualJoystick extends Phaser.GameObjects.Container {
    private base: Phaser.GameObjects.Image;
    private thumb: Phaser.GameObjects.Image;
    private maxDist: number = 50;
    private pointerId: number | null = null;
    public joyVector: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.joyVector = new Phaser.Math.Vector2(0, 0);

        // Create Base
        this.base = scene.add.image(0, 0, 'joy_base');
        this.add(this.base);

        // Create Thumb
        this.thumb = scene.add.image(0, 0, 'joy_thumb');
        this.add(this.thumb);

        this.setSize(100, 100);
        this.setInteractive();

        // Scene input events (global) to handle dragging outside container
        scene.input.on('pointerdown', this.onTouchStart, this);
        scene.input.on('pointermove', this.onTouchMove, this);
        scene.input.on('pointerup', this.onTouchEnd, this);
    }

    private onTouchStart(pointer: Phaser.Input.Pointer) {
        // Check if touch is reasonably close to joystick center to "grab" it
        // Or if we want floating joystick (not now)
        const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.x, this.y);
        if (dist <= 60 && this.pointerId === null) {
            this.pointerId = pointer.id;
            this.updateJoystick(pointer.x, pointer.y);
        }
    }

    private onTouchMove(pointer: Phaser.Input.Pointer) {
        if (pointer.id === this.pointerId) {
            this.updateJoystick(pointer.x, pointer.y);
        }
    }

    private onTouchEnd(pointer: Phaser.Input.Pointer) {
        if (pointer.id === this.pointerId) {
            this.pointerId = null;
            this.thumb.setPosition(0, 0);
            this.joyVector.set(0, 0);
            this.emit('update', this.joyVector);
        }
    }

    private updateJoystick(x: number, y: number) {
        const localX = x - this.x;
        const localY = y - this.y;

        const angle = Phaser.Math.Angle.Between(0, 0, localX, localY);
        let dist = Phaser.Math.Distance.Between(0, 0, localX, localY);

        if (dist > this.maxDist) {
            dist = this.maxDist;
        }

        this.thumb.x = Math.cos(angle) * dist;
        this.thumb.y = Math.sin(angle) * dist;

        // Normalize vector (-1 to 1)
        this.joyVector.set(
            this.thumb.x / this.maxDist,
            this.thumb.y / this.maxDist
        );
    }
}
