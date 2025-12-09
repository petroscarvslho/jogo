```typescript
import { Scene } from 'phaser';
import { VitalSignsSystem } from '../systems/VitalSignsSystem';
import { ScenarioManager, CasePhase } from '../systems/ScenarioManager';
import { AudioManager } from '../systems/AudioManager';
import { WaveformMonitor } from '../ui/WaveformMonitor';

export class SurgeryScene extends Scene {
    // Monitor Panels
    private logText!: Phaser.GameObjects.Text;
    private actionMenu!: Phaser.GameObjects.Container;
    private patientSprite!: Phaser.GameObjects.Image;
    private waveform!: WaveformMonitor; // New EKG

    // SYSTEMS
    private vitalSystem!: VitalSignsSystem;
    private scenarioManager!: ScenarioManager;
    private audioManager!: AudioManager;

    private currentPhase: CasePhase = CasePhase.INDUCTION;
    private lastBeatTime: number = 0; // For tracking heartbeats

    constructor() {
        super('SurgeryScene');
    }

    create() {
        // 1. Background - Surgical Themed Tiled Floor
        // Create a tiled sprite filling the screen
        this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'tile_floor').setOrigin(0);

        // Dark Overlay for "Ambience" (Vignette effect simulated)
        const vignette = this.add.graphics();
        vignette.fillStyle(0x000000, 0.2); // Slightly darker for contrast
        vignette.fillRect(0, 0, this.scale.width, this.scale.height);

        // 2. Patient (Center)
        this.patientSprite = this.add.image(this.scale.width / 2, this.scale.height * 0.55, 'bed_patient');
        this.patientSprite.setScale(3.5);

        // 3. UI Layer (Top Bar - Info & Vitals)
        this.createTopBar();

        // 4. Action Menu (Bottom Tray - Clinical Style)
        this.createBottomTray();

        // 5. Initialize Simulation & Scenario
        this.vitalSystem = new VitalSignsSystem();
        this.scenarioManager = new ScenarioManager();
        this.audioManager = new AudioManager();

        // 6. Setup Callbacks
        this.scenarioManager.onDialogue = (msg) => this.showNotification(msg, true);
        this.scenarioManager.onEventEffect = (eff) => {
            this.vitalSystem.applyEvent(eff);
            this.cameras.main.shake(300, 0.005);
            this.audioManager.playAlarm(); // Alarm sound on event
        };

        // 7. Start Case Briefing (Novel Mode)
        this.createCaseBriefing();
    }

    createCaseBriefing() {
        const dimmer = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0).setInteractive();

        const panel = this.add.container(this.scale.width / 2, this.scale.height / 2);

        const bg = this.add.rectangle(0, 0, 300, 400, 0xecf0f1).setOrigin(0.5);
        bg.setStrokeStyle(4, 0x2c3e50);

        const portrait = this.add.image(0, -100, 'bed_patient').setScale(4);

        const title = this.add.text(0, -40, "CASO 1: JOÃO SILVA", {
            fontSize: '20px', color: '#2c3e50', fontStyle: 'bold', fontFamily: 'Courier'
        }).setOrigin(0.5);

        const story = "Paciente 64 anos.\nColetomia Total.\n\nObjetivo: Anestesia Geral Balanceada.\n\nFique atento aos sinais vitais!";
        const desc = this.add.text(0, 50, story, {
            fontSize: '16px', color: '#34495e', align: 'center', wordWrap: { width: 260 }
        }).setOrigin(0.5);

        const btn = this.add.rectangle(0, 150, 200, 50, 0x27ae60).setInteractive();
        const btnText = this.add.text(0, 150, "INICIAR CIRURGIA", { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

        panel.add([bg, portrait, title, desc, btn, btnText]);

        panel.setScale(0);
        this.tweens.add({ targets: panel, scale: 1, duration: 300, ease: 'Back.out' });

        btn.on('pointerdown', () => {
            this.tweens.add({
                targets: [panel, dimmer],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    panel.destroy();
                    dimmer.destroy();
                    this.activePhase(CasePhase.INDUCTION);
                    this.showNotification("Fase: INDUÇÃO", false);
                    this.audioManager.playBeep(600, 0.1); // Start beep
                }
            });
        });
    }

    activePhase(phase: CasePhase) {
        this.currentPhase = phase;
        this.scenarioManager.startPhase(phase);

        // Update UI Text
        if (this.logText) this.logText.setText(`Fase: ${ phase } `);
    }

    update(_time: number, delta: number) {
        if (this.vitalSystem && this.scenarioManager && this.currentPhase !== CasePhase.RECOVERY) {
            const dt = delta / 1000;
            this.vitalSystem.update(dt);
            this.updateMonitor(); // Updates text
            
            // EKG Waveform Update
            const vitals = this.vitalSystem.getVitals();
            if (this.waveform) {
                this.waveform.update(dt, vitals.hr);
            }
            
            // Heartbeat Logic
            // const vitals = this.vitalSystem.getVitals(); // Already fetched above
            const beatInterval = 60 / vitals.hr; // seconds per beat
            if (dt > 0) this.lastBeatTime += dt;

            if (this.lastBeatTime >= beatInterval) {
                this.lastBeatTime = 0;
                // Pitch varies with saturation (lower pitch = danger)
                const pitch = vitals.spo2 < 90 ? 400 + (vitals.spo2 * 2) : 800;
                this.audioManager.playBeep(pitch);
            }

            // Update Scenario Engine
            const status = this.scenarioManager.update(dt, vitals);

            if (status === 'defeat') {
                this.audioManager.playFailure();
                this.showGameOver();
                this.scene.pause();
            } else if (status === 'victory') {
                this.audioManager.playSuccess();
                this.showVictory();
                this.scene.pause();
            }
        }
    }

    showGameOver() {
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8).setOrigin(0);
        this.add.text(this.scale.width / 2, this.scale.height / 2, "PACIENTE OBITOU\n\nSinais Vitais Críticos.", {
            fontSize: '30px', color: '#e74c3c', align: 'center', fontStyle: 'bold'
        }).setOrigin(0.5);

        const btn = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, "Tentar Novamente", {
            fontSize: '20px', color: '#fff', backgroundColor: '#e74c3c', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        btn.on('pointerdown', () => this.scene.restart());
    }

    showVictory() {
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8).setOrigin(0);

        // Victory Panel
        const panel = this.add.container(this.scale.width / 2, this.scale.height / 2);
        const pBg = this.add.rectangle(0, 0, 400, 250, 0x27ae60).setOrigin(0.5).setStrokeStyle(4, 0xffffff);

        const title = this.add.text(0, -60, "CIRURGIA CONCLUÍDA", {
            fontSize: '28px', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const sub = this.add.text(0, 0, "Paciente estável e recuperado.\nÓtimo trabalho, Doutor!", {
            fontSize: '18px', color: '#ecf0f1', align: 'center'
        }).setOrigin(0.5);

        const btn = this.add.text(0, 80, "[ PRÓXIMO CASO ]", {
            fontSize: '20px', color: '#fff', backgroundColor: '#2c3e50', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        btn.on('pointerdown', () => {
            // Placeholder for next case or menu
            this.scene.start('MainMenu');
        });

        panel.add([pBg, title, sub, btn]);
        panel.setScale(0);
        this.tweens.add({ targets: panel, scale: 1, duration: 500, ease: 'Back.out' });

        this.add.existing(panel);
    }

    // Monitor Panels (References for update)
    private hrPanelText!: Phaser.GameObjects.Text;
    private bpPanelText!: Phaser.GameObjects.Text;
    private spo2PanelText!: Phaser.GameObjects.Text;

    createTopBar() {
        const barHeight = 150;
        const width = this.scale.width;

        // Monitor Casing (Dark Grey)
        this.add.rectangle(0, 0, width, barHeight, 0x2d3436).setOrigin(0);

        // Patient Info (Top Left, Small)
        this.add.text(10, 10, "PACIENTE: João Silva (64a)", { fontSize: '14px', color: '#bdc3c7', fontFamily: 'Arial' });
        this.logText = this.add.text(width - 200, 10, "Fase: PREPARO", { fontSize: '14px', color: '#f1c40f', align: 'right' }).setOrigin(0);

        // --- VITAL SIGNS LCD PANELS ---
        // 1. Heart Rate (Green)
        this.hrPanelText = this.createLCDPanel(width / 2 - 150, 40, "HR (bpm)", "#2ecc71");

        // 2. Blood Pressure (Yellow/Orange)
        this.bpPanelText = this.createLCDPanel(width / 2, 40, "NIBP (mmHg)", "#f1c40f");

        // 3. SpO2 (Blue)
        this.spo2PanelText = this.createLCDPanel(width / 2 + 150, 40, "SpO2 (%)", "#00cec9");
        
        // EKG GRAPH (The "Max" feature)
        // Positioned below the numbers
        this.waveform = new WaveformMonitor(this, width/2 - 200, 80, 400, 60, 0x2ecc71);
    }

    createLCDPanel(x: number, y: number, label: string, color: string): Phaser.GameObjects.Text {
        // Panel Background (Black Glass)
        const bg = this.add.rectangle(x, y, 140, 80, 0x000000).setOrigin(0.5);
        bg.setStrokeStyle(2, 0x636e72);
        
        // Label (Top Left of panel)
        this.add.text(x - 65, y - 35, label, { fontSize: '12px', color: color });
        
        // Value Text (Center)
        return this.add.text(x, y + 10, "--", { 
            fontFamily: 'Courier', fontSize: '36px', color: color, fontStyle: 'bold' 
        }).setOrigin(0.5);
    }

    updateMonitor() {
        const v = this.vitalSystem.getVitals();

        // Update Values
        this.hrPanelText.setText(v.hr.toFixed(0));
        this.bpPanelText.setText(`${ v.sbp.toFixed(0) }/${v.dbp.toFixed(0)}`);
this.spo2PanelText.setText(v.spo2.toFixed(0));

// Color Warnings
this.hrPanelText.setColor((v.hr < 50 || v.hr > 120) ? '#ff0000' : '#2ecc71');
this.spo2PanelText.setColor(v.spo2 < 90 ? '#ff0000' : '#00cec9');

// Update ECG Waveform
this.waveform.update(v.ecg);
    }

createBottomTray() {
    const trayHeight = 220;
    const y = this.scale.height - trayHeight;
    const width = this.scale.width;

    // Tray Background (Metal/Medical Grey)
    this.add.rectangle(0, y, width, trayHeight, 0xdfe6e9).setOrigin(0);
    this.add.rectangle(0, y, width, 5, 0xbdc3c7).setOrigin(0); // Top border

    this.add.text(20, y + 15, "INTERVENÇÕES", { fontSize: '14px', color: '#7f8c8d', fontStyle: 'bold' });

    this.actionMenu = this.add.container(0, y + 50);

    const actions = [
        { id: 'fent', label: 'Fentanil', sub: 'Dor', icon: 'icon_syringe', color: 0x3498db, action: () => this.applyTreatment('drug_fentanyl', "Fentanil Adminstrado") },
        { id: 'prop', label: 'Propofol', sub: 'Hipnose', icon: 'icon_syringe', color: 0xf1c40f, action: () => this.applyTreatment('drug_propofol', "Propofol Injetado") },
        { id: 'roc', label: 'Rocuronio', sub: 'Relax', icon: 'icon_syringe', color: 0xe74c3c, action: () => this.applyTreatment('drug_rocuronium', "Curarização realizada") },
        { id: 'iot', label: 'Intubar', sub: 'Via Aérea', icon: 'icon_tube', color: 0x9b59b6, action: () => this.applyProcedure('intubation', "IOT Realizada") },
        { id: 'mask', label: 'Ventilar', sub: 'O2 100%', icon: 'icon_mask', color: 0x2ecc71, action: () => this.applyProcedure('ventilation', "Ventilação Manual") }
    ];

    let startX = 30;

    actions.forEach((act) => {
        const btn = this.add.container(startX, 0);

        // Button Box
        const bg = this.add.rectangle(0, 0, 90, 110, 0xffffff).setOrigin(0).setInteractive();
        bg.setStrokeStyle(2, 0xbdc3c7);

        // Icon Background Circle
        const iconBg = this.add.circle(45, 40, 25, act.color, 0.2).setOrigin(0.5);

        // Icon Sprite
        const icon = this.add.image(45, 40, act.icon).setScale(1.2);

        // Label
        const lbl = this.add.text(45, 75, act.label, { fontSize: '12px', color: '#2c3e50', fontStyle: 'bold' }).setOrigin(0.5);
        const sub = this.add.text(45, 90, act.sub, { fontSize: '10px', color: '#7f8c8d' }).setOrigin(0.5);

        // Color Strip at bottom
        const strip = this.add.rectangle(0, 105, 90, 5, act.color).setOrigin(0);

        btn.add([bg, iconBg, icon, lbl, sub, strip]);

        // Hover Effect
        bg.on('pointerover', () => {
            bg.setFillStyle(0xf5f6fa);
            this.tweens.add({ targets: btn, y: -5, duration: 100 });
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0xffffff);
            this.tweens.add({ targets: btn, y: 0, duration: 100 });
        });
        bg.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 0.95, yoyo: true, duration: 50 });
            act.action();
        });

        this.actionMenu.add(btn);
        startX += 110;
    });
}

applyTreatment(drugId: string, logMsg: string) {
    // 1. Physical Effect
    this.vitalSystem.applyDrugEffect(drugId);

    // 2. Scenario Resolution (Did this fix a crisis?)
    const solved = this.scenarioManager.handleAction(drugId);

    // 3. Feedback
    if (solved) {
        this.showNotification("✅ Crise Resolvida! (" + drugId + ")", false); // Green check
        this.audioManager.playSuccess();
    } else {
        this.showNotification(logMsg, false);
    }

    this.tweens.add({
        targets: this.patientSprite,
        alpha: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 1
    });
}

applyProcedure(procId: string, logMsg: string) {
    this.vitalSystem.applyProcedureEffect(procId);

    // Check Scenario Resolution
    const solved = this.scenarioManager.handleAction(procId);
    if (solved) {
        this.audioManager.playSuccess();
        logMsg = "✅ " + logMsg;
    }

    if (procId === 'intubation') {
        if (this.currentPhase === CasePhase.INDUCTION) {
            this.activePhase(CasePhase.MAINTENANCE);
            this.showNotification(logMsg + " -> Fase: MANUTENÇÃO", false);
        } else {
            this.showNotification(logMsg, false);
        }
    } else {
        this.showNotification(logMsg, false);
    }
}

showNotification(msg: string, isSurgeon: boolean = false) {
    // Remove existing notification to prevent overlap
    const existing = this.children.getByName('toast');
    if (existing) existing.destroy();

    const y = this.scale.height - 250;

    const container = this.add.container(this.scale.width / 2, y).setName('toast');

    const text = this.add.text(0, 0, msg, {
        fontSize: '18px', color: '#fff', padding: { x: 15, y: 10 }, fontStyle: isSurgeon ? 'bold' : 'normal'
    }).setOrigin(0.5);

    const bg = this.add.rectangle(0, 0, text.width, text.height, isSurgeon ? 0xd35400 : 0x2c3e50).setOrigin(0.5).setStrokeStyle(2, 0xffffff);

    container.add([bg, text]);
    container.setAlpha(0);

    this.tweens.add({
        targets: container,
        alpha: 1,
        y: y - 20,
        duration: 300,
        hold: 3000,
        yoyo: true,
        onComplete: () => container.destroy()
    });
}
}
