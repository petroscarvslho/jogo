export class AudioManager {
    private ctx: AudioContext;
    private gainNode: GainNode;
    private isMuted: boolean = false;

    constructor() {
        // Initialize Web Audio API
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        this.gainNode.gain.value = 0.1; // Low volume default
    }

    public playBeep(pitch: number = 800, duration: number = 0.1) {
        if (this.isMuted || this.ctx.state === 'suspended') {
            this.ctx.resume();
            if (this.isMuted) return;
        }

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);

        // Envelope for a "medical beep" (sharp attack, quick decay)
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    public playAlarm() {
        // High-low-high pattern
        this.playBeep(1200, 0.1);
        setTimeout(() => this.playBeep(800, 0.1), 150);
        setTimeout(() => this.playBeep(1200, 0.1), 300);
    }

    public playSuccess() {
        // Simple ascending arpeggio
        this.playBeep(523.25, 0.1); // C5
        setTimeout(() => this.playBeep(659.25, 0.1), 100); // E5
        setTimeout(() => this.playBeep(783.99, 0.2), 200); // G5
    }

    public playFailure() {
        // Descending low tone
        this.playBeep(300, 0.3);
        setTimeout(() => this.playBeep(200, 0.4), 300);
    }

    public setMute(mute: boolean) {
        this.isMuted = mute;
    }
}
