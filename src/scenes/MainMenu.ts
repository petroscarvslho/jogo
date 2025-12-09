import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, height / 3, 'JOGO ANEST', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        const startBtn = this.add.text(width / 2, height / 2, 'INICIAR PLANTÃO', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('Hospital'))
            .on('pointerover', () => startBtn.setStyle({ color: '#ffff00' }))
            .on('pointerout', () => startBtn.setStyle({ color: '#00ff00' }));
    }
}
