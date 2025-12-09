# Jogo de Simulação de Anestesia (Project Context)

## 🏥 Visão Geral do Projeto
Este é um jogo de **simulação de anestesiologia** focado no realismo clínico e narrativa dramática ("Novelinha"), estilo *Trauma Center* com estética *Project Hospital* (Pixel Art).
O jogador assume o papel de um anestesista no centro cirúrgico, gerenciando sinais vitais, administrando drogas e reagindo a eventos roteirizados.

**Tech Stack:**
- **Engine:** Phaser 3
- **Linguagem:** TypeScript
- **Build Tool:** Vite
- **Estilo:** Pixel Art / UI Clínica Limpa

---

## 🧠 Arquitetura do Sistema

### 1. `VitalSignsSystem.ts` (O Coração da Simulação)
- **Responsabilidade:** Simula a fisiologia do paciente (HR, BP, SpO2, Temp).
- **Lógica:** Loop de atualização (`update(dt)`) que decai drogas e recupera sinais vitais para a homeostase se não houver insultos.
- **Interação:** Recebe comandos como `applyDrugEffect('fentanyl')` ou `applyEvent('bleeding')`.

### 2. `ScenarioManager.ts` (O Roteirista)
- **Responsabilidade:** Gerencia a narrativa e o fluxo do caso ("Novelinha").
- **Estrutura:**
  - `CaseScenario`: Define as fases (Indução, Manutenção, etc.) e lista de eventos.
  - `ScriptedEvent`: Eventos individuais (ex: "Cirurgião reclama de dor", "Sangramento súbito").
  - `update()`: Verifica gatilhos de tempo ou condição (ex: `vitals.hr > 100`) para disparar eventos.
- **Estados:** Retorna `'running'`, `'victory'` ou `'defeat'`.

### 3. `SurgeryScene.ts` (O Palco Principal)
- **Responsabilidade:** Integra UI, Vitals e Scenario.
- **Ciclo de Jogo:**
  1. **Briefing:** Janela inicial com história do paciente.
  2. **Loop Cirúrgico:** `update()` roda Vitals e Scenario a cada frame.
  3. **Intervenção:** Botões da UI chamam `applyTreatment()`, que:
     - Afeta fisicamente o paciente (`vitalSystem`).
     - Tenta resolver o evento narrativo (`scenarioManager.handleAction()`).
  4. **Feedback:** Mostra toasts de sucesso/erro e telas de Vitória/Game Over.

---

## 🎮 Estado Atual do Jogo

### Caso 1: Coletomia do Sr. João
- **Objetivo:** Manter o Sr. João vivo durante uma cirurgia de grande porte.
- **Mecânica de Vitória:** Sobreviver até o fim da fase de Manutenção (tempo simulado > última crise).
- **Mecânica de Derrota:** 
  - Frequência Cardíaca < 30 ou > 170.
  - SpO2 < 70%.
- **Eventos Implementados:**
  - Incisão (Dor) -> Requer Analgesia.
  - Sangramento -> Requer estabilização.

---

## 📂 Estrutura de Pastas Importante
- `/src/scenes/`: Cenas do Phaser (`SurgeryScene`, `MainMenu`).
- `/src/systems/`: Lógica pura (`vitalSignsSystem`, `ScenarioManager`).
- `/assets/`: Sprites e imagens (Pixel art placeholders atuais).

## 🚀 Próximos Passos (To-Do List)
1. **Refinamento Visual:** Substituir placeholders por Pixel Art final (Bisturi, Monitor Realista).
2. **Mais Casos:** Criar JSONs para novos cenários (Cesariana, Neurocirurgia).
3. **Farmácia:** Expandir inventário de drogas (Vasopressores, Hipnóticos).
4. **Som:** Adicionar bips de monitor e sons de evento.

---

*Este documento serve para contextualizar qualquer IA ou desenvolvedor que entre no projeto daqui para frente.*
