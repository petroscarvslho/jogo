export interface VitalSigns {
    hr: number; // Heart Rate (bpm)
    sbp: number; // Systolic BP (mmHg)
    dbp: number; // Diastolic BP (mmHg)
    spo2: number; // Oxygen Saturation (%)
    temp: number; // Temperature (C)
}

export class VitalSignsSystem {
    private vitals: VitalSigns;
    private targetVitals: VitalSigns;
    private stability: number; // 0-100 (100 = perfect)

    constructor() {
        this.vitals = { hr: 80, sbp: 120, dbp: 80, spo2: 98, temp: 36.5 };
        this.targetVitals = { ...this.vitals };
        this.stability = 100;
    }

    public update(deltaSeconds: number) {
        // Smoothly interpolate current vitals towards target vitals
        const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
        const speed = 0.5 * deltaSeconds;

        this.vitals.hr = lerp(this.vitals.hr, this.targetVitals.hr, speed);
        this.vitals.sbp = lerp(this.vitals.sbp, this.targetVitals.sbp, speed);
        this.vitals.dbp = lerp(this.vitals.dbp, this.targetVitals.dbp, speed);
        this.vitals.spo2 = lerp(this.vitals.spo2, this.targetVitals.spo2, speed);

        // Add natural noise (heartbeat variability)
        this.vitals.hr += (Math.random() - 0.5) * 0.5;
        this.vitals.sbp += (Math.random() - 0.5) * 0.5;
    }

    public applyDrugEffect(drugId: string) {
        // Pharmacological Logic
        switch (drugId) {
            case 'drug_propofol':
                this.targetVitals.sbp -= 20;
                this.targetVitals.dbp -= 15;
                this.targetVitals.spo2 -= 2; // Apnea risk
                break;
            case 'drug_fentanyl':
                this.targetVitals.hr -= 10;
                this.targetVitals.sbp -= 5;
                break;
            case 'drug_ephedrine':
                this.targetVitals.sbp += 15;
                this.targetVitals.dbp += 10;
                this.targetVitals.hr += 10;
                break;
            case 'drug_atropine':
                this.targetVitals.hr += 20;
                break;
            case 'drug_lidocaine':
                // Anti-arrhythmic (stabilizes noise - logic TODO)
                break;
        }
        // Clamping logic to realistic limits
        this.clampTargets();
    }

    public applyProcedureEffect(procedure: string) {
        if (procedure === 'spinal') {
            // Sympathectomy -> Vasodilation
            this.targetVitals.sbp -= 30;
            this.targetVitals.dbp -= 20;
            this.targetVitals.hr -= 5;
        } else if (procedure === 'intubation') {
            // Sympathetic stimulus -> Tachycardia/Hypertension
            this.targetVitals.hr += 20;
            this.targetVitals.sbp += 20;
        }
    }

    public applyEvent(eventType: string) {
        switch (eventType) {
            case 'pain':
                // Surgical stimulus: HR++, BP++
                this.targetVitals.hr += 15;
                this.targetVitals.sbp += 15;
                this.targetVitals.dbp += 10;
                break;
            case 'bleeding':
                // Hypovolemia: HR++, BP--
                this.targetVitals.hr += 10;
                this.targetVitals.sbp -= 15;
                this.targetVitals.dbp -= 10;
                break;
        }
        this.clampTargets();
    }

    private clampTargets() {
        this.targetVitals.hr = Math.max(30, Math.min(180, this.targetVitals.hr));
        this.targetVitals.sbp = Math.max(40, Math.min(220, this.targetVitals.sbp));
        this.targetVitals.spo2 = Math.max(0, Math.min(100, this.targetVitals.spo2));
    }

    public getVitals(): VitalSigns {
        return {
            hr: Math.round(this.vitals.hr),
            sbp: Math.round(this.vitals.sbp),
            dbp: Math.round(this.vitals.dbp),
            spo2: Math.round(this.vitals.spo2),
            temp: this.vitals.temp
        };
    }
}
