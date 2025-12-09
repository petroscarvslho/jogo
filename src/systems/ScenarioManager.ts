import { VitalSignsSystem } from './VitalSignsSystem';

export enum CasePhase {
    BRIEFING = 'Briefing',
    INDUCTION = 'Indução',
    MAINTENANCE = 'Manutenção',
    EMERGENCE = 'Despertar',
    RECOVERY = 'Recuperação'
}

export interface ScriptedEvent {
    id: string;
    triggerTime?: number; // Time in seconds relative to phase start
    triggerCondition?: (vitals: any) => boolean; // Or simple string key
    dialogue: string; // What the surgeon says
    autoEffect?: string; // 'pain', 'bleeding', 'bradycardia'
    requiredAction?: string; // 'drug_fentanyl', 'intubation'
    triggered?: boolean; // Has the event started?
    solved?: boolean; // Has the player fixed it?
}

export interface CaseScenario {
    id: string;
    title: string;
    patientName: string;
    description: string;
    phases: {
        [key in CasePhase]?: ScriptedEvent[];
    };
}

export class ScenarioManager {
    private currentCase: CaseScenario;
    private currentPhase: CasePhase;
    private phaseTimer: number = 0;
    private activeEvents: ScriptedEvent[] = [];

    // Callback to Scene
    public onDialogue?: (msg: string) => void;
    public onEventEffect?: (effectId: string) => void;

    constructor() {
        // Hardcoded Case 1 for now
        this.currentCase = {
            id: 'case001',
            title: 'Coletomia Total',
            patientName: 'João Silva',
            description: 'Paciente hipertenso. Cirurgia de grande porte.',
            phases: {
                [CasePhase.INDUCTION]: [
                    { id: 'ind_start', triggerTime: 2, dialogue: 'Pode induzir, doutor. Estou aguardando.' },
                    { id: 'ind_wait', triggerTime: 10, dialogue: 'Paciente ainda acordado... vai demorar?', triggerCondition: (v) => v.hr > 90 }
                ],
                [CasePhase.MAINTENANCE]: [
                    { id: 'incisao', triggerTime: 5, dialogue: 'Bisturi. Incisão iniciada!', autoEffect: 'pain' },
                    { id: 'bleed_event', triggerTime: 20, dialogue: 'Sangramento na cavidade! A pressão vai cair!', autoEffect: 'bleeding' },
                    { id: 'closing', triggerTime: 40, dialogue: 'Hemorragia controlada. Fechando planos.' }
                ]
            }
        };
        this.currentPhase = CasePhase.BRIEFING;
    }

    public startPhase(phase: CasePhase) {
        this.currentPhase = phase;
        this.phaseTimer = 0;
        this.activeEvents = this.currentCase.phases[phase] ? [...this.currentCase.phases[phase]!] : [];
        // Reset solved status
        this.activeEvents.forEach(e => e.solved = false);
    }

    public update(dt: number, vitals: any): 'running' | 'victory' | 'defeat' {
        this.phaseTimer += dt;

        // 1. Check Vital Signs for Game Over
        if (vitals.hr < 30 || vitals.hr > 170 || vitals.spo2 < 70) {
            return 'defeat';
        }

        // 2. Check Scenario Progression
        let allEventsResolved = true;
        this.activeEvents.forEach(evt => {
            if (!evt.solved) allEventsResolved = false;

            // Trigger Logic
            let ready = false;
            if (evt.triggerTime !== undefined && this.phaseTimer >= evt.triggerTime && !evt.triggered) {
                ready = true;
            }
            if (evt.triggerCondition && evt.triggerCondition(vitals) && !evt.triggered) {
                ready = true;
            }

            if (ready) {
                this.triggerEvent(evt);
            }
        });

        // 3. Check for Phase Completion
        if (allEventsResolved && this.activeEvents.length > 0) {
            // Check if we are at the end of the events list time-wise? 
            // For MVP, if all events are solved and we are past the last trigger time + buffer
            const lastEventTime = this.activeEvents[this.activeEvents.length - 1].triggerTime || 0;

            if (this.phaseTimer > lastEventTime + 5) {
                // Phase Complete!
                if (this.currentPhase === CasePhase.MAINTENANCE) {
                    return 'victory'; // End of Case 1 for now
                }
            }
        }

        return 'running';
    }

    private triggerEvent(evt: ScriptedEvent) {
        evt.triggered = true; // Mark as triggered (shown to player)

        if (this.onDialogue && evt.dialogue) {
            this.onDialogue(evt.dialogue);
        }

        if (this.onEventEffect && evt.autoEffect) {
            this.onEventEffect(evt.autoEffect);
        }
    }

    // Call this when player uses a drug/action
    public handleAction(actionId: string): boolean {
        // Find an active event that requires this action
        const evt = this.activeEvents.find(e => e.triggered && !e.solved && e.requiredAction === actionId);

        if (evt) {
            evt.solved = true;
            return true; // Action solved a crisis!
        }
        return false; // Just a normal action
    }

    public getCurrentPhase() {
        return this.currentPhase;
    }
}
