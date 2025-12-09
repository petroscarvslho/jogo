import { Scene } from 'phaser';

export class WaveformMonitor {
    private scene: Scene;
    private graphics: Phaser.GameObjects.Graphics;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private color: number;

    // Data Buffer
    private data: number[] = [];
    private maxPoints: number;
    private lastX: number = 0;

    // Simulation
    private phase: number = 0; // Cycle position
    private lastBeat: number = 0;

    constructor(scene: Scene, x: number, y: number, width: number, height: number, color: number = 0x2ecc71) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.graphics = scene.add.graphics();
        this.maxPoints = Math.floor(width / 2); // 2 pixels per point

        // Init flatline
        for (let i = 0; i < this.maxPoints; i++) {
            this.data.push(0);
        }
    }

    public update(dt: number, hr: number) {
        // Scroll Data
        this.data.shift();

        // Generate new point based on HR
        let newVal = 0;

        // 60 BPM = 1 beat per second
        // Cycle Length in seconds = 60 / HR
        const cycleDuration = 60 / Math.max(hr, 1);

        this.phase += dt;
        if (this.phase >= cycleDuration) {
            this.phase = 0; // Loop
        }

        // Normalized position in cardiac cycle (0.0 to 1.0)
        const t = this.phase / cycleDuration;

        // Simulate P-QRS-T Waveform shape
        // P Wave (0.1 - 0.2)
        if (t > 0.1 && t < 0.2) newVal = -5 * Math.sin((t - 0.1) * 10 * Math.PI);
        // QRS Complex (0.3 - 0.4) - The big spike
        else if (t > 0.3 && t < 0.32) newVal = 5; // Q
        else if (t >= 0.32 && t < 0.36) newVal = -40; // R (Up is negative y in Phaser usually, checking coordinate system. Default is Y down. So Up is negative)
        // Wait, Y=0 is center. -40 is UP.
        else if (t >= 0.36 && t < 0.38) newVal = 10; // S
        // T Wave (0.5 - 0.7)
        else if (t > 0.5 && t < 0.7) newVal = -10 * Math.sin((t - 0.5) * 5 * Math.PI);

        // Random Noise
        newVal += (Math.random() - 0.5) * 2;

        // Flatline if dead
        if (hr < 10) newVal = (Math.random() - 0.5) * 1;

        this.data.push(newVal);

        this.draw();
    }

    private draw() {
        this.graphics.clear();

        // Clipping region (optional, or just be careful)

        // Draw the line
        this.graphics.lineStyle(2, this.color, 1);
        this.graphics.beginPath();

        const centerY = this.y + this.height / 2;

        let startX = this.x;
        const stepX = this.width / this.maxPoints;

        this.graphics.moveTo(startX, centerY + this.data[0]);

        for (let i = 1; i < this.data.length; i++) {
            startX += stepX;
            // Scan bar effect: fade out the leading edge? 
            // For now just draw all
            this.graphics.lineTo(startX, centerY + this.data[i]);
        }

        this.graphics.strokePath();

        // "Scan Bar" Eraser (Green fade)
        // Simple visual trick: just redraw constantly is fine for this scale
    }
}
