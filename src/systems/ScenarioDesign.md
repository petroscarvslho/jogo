# Logic for Scripted Surgery Cases

The "Engine" will now run based on a timeline of events defined in a JSON-like structure (Case Scenario).

## Structure
- **CasePhase**: Induction -> Surgery (Scripted) -> Emergence.
- **Scripted Events**:
    - `time`: When it happens (or trigger condition).
    - `dialogue`: What the surgeon says ("Vou iniciar o corte!").
    - `effect`: Physiological change (Pain stimulus).
    - `requiredAction`: What player must do to solve it.

## Example Scenario: "Coletomia do Sr. João"
1.  **Start**: Briefing (Done).
2.  **Induction**: Player induces.
3.  **T=0s (Surgery Start)**: Surgeon: "Bisturi na mão. Incisão!" -> **Stimulus: Pain**.
4.  **T=30s**: Surgeon: "A musculatura está travada, não consigo expor!" -> **Hint: Rocuronium needed**.
5.  **T=60s**: "Sangramento na artéria mesentérica!" -> **Event: Massive Bleed**.
6.  **End**: Surgeon: "Fechando a pele." -> Stop gases.

This satisfies:
- "Novelinha" (Story/Dialogue).
- "Project Hospital" (Clinical Logic/Steps).
- "Pixel Art" (Visuals).
