# USG Game — Bloqueio Supraclavicular (v0.1.0)

Protótipo web simples de ultrassonografia para treino de bloqueio supraclavicular do plexo braquial. O render é feito em canvas com speckle fake e camadas anatômicas estilizadas para rodar direto no navegador (inclusive Safari no iPhone).

## 🚀 Rodando localmente
1. Instale Python 3 (já vem no macOS e em muitas distros Linux).
2. No terminal, dentro da pasta do projeto, rode um servidor simples:
   ```bash
   python -m http.server 8000
   ```
3. Abra `http://localhost:8000` no navegador.

> Abrir o `index.html` direto do sistema de arquivos pode dar tela preta no iOS. Use sempre um servidor, mesmo que simples.

## 🌐 GitHub Pages
- Branch: `main`
- Pasta: `/(root)`
- URL esperada depois de publicar: `https://<seu-usuario>.github.io/jogo/`

Ative nas configurações do repositório (Settings → Pages) escolhendo o branch `main` e a pasta `/(root)`.

## 🧼 Limpando cache no Safari
Safari em iOS é teimoso com cache. Dicas:
- Abra em aba anônima.
- Acrescente uma query string na URL ou no script, por exemplo `?v=2`.
- No HTML já usamos `<script src="main.js?v=0.1.0"></script>` para quebrar cache automaticamente após mudanças.

## 🎮 Controles do protótipo
- Arraste o probe no canvas para deslizar (touch ou mouse).
- Sliders: ganho, profundidade, pressão, tilt.
- Score prioriza plexo no centro, artéria visível e tilt moderado (0–1000).

## 🧩 Estrutura
- `index.html`: página e UI.
- `main.js`: lógica de render e simulação fake.

Sinta-se à vontade para iterar e adicionar novas features (agulha in-plane, injeção, etc.).
