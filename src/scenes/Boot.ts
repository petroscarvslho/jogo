import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load minimal assets if needed (e.g. loading bar)
    }

    create() {
        this.scene.start('Preload');
    }
}
