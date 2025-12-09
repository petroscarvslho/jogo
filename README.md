# Jogo Anest

Um RPG / Simulação 2D em Pixel Art sobre a rotina de um médico anestesiologista. Jogo em estilo "Top-Down" (Zelda/Pokémon) focado em casos clínicos, escolha de drogas e gestão de crises no centro cirúrgico.

## 🚀 Como Rodar o Jogo

Este jogo feito com tecnologias web modernas (HTML5 + Phaser 3). Siga os passos:

### Pré-requisitos
* Ter o **Node.js** instalado (v16 ou superior).

### Instalação
1. Abra o terminal na pasta do projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```

### Jogando (Modo Desenvolvimento)
1. Rode o servidor local:
   ```bash
   npm run dev
   ```
2. Clique no link que aparece (geralmente `http://localhost:5173`) ou copie para o navegador.

O jogo foi pensado para **Mobile (modo retrato)**. Se estiver no computador, abra as ferramentas de desenvolvedor (F12) e ative o modo dispositivo móvel (Ctrl+Shift+M) com resolução 1080x1920 ou similar.

## 🎮 Controles

* **Computador**:
    * **W, A, S, D** ou **Setas**: Movimentar o personagem.
    * **Mouse**: Clicar nos botões de interação.
* **Celular / Touch**:
    * **Joystick Virtual (Canto Inferior Esquerdo)**: Movimentar.
    * **Botão A (Canto Inferior Direito)**: Interagir com objetos/pacientes.

## 📂 Estrutura de Arquivos

* `src/scenes/`: Cenas do jogo (Hospital, Cirurgia, Menu).
* `src/entities/`: Definições de Pacientes e Itens.
* `data/`: Arquivos JSON com a lista de Pacientes e Medicamentos.
* `assets/`: Onde colocar suas imagens reais.

## 🎨 Adicionando seus Assets

Atualmente o jogo usa "placeholders" (quadrados coloridos). Para usar seus assets pixel art:

1. Coloque seus arquivos PNG em `assets/`.
2. Edite o arquivo `src/scenes/Preload.ts`.
3. Na função `preload()`, troque os placeholders por:
   ```typescript
   this.load.image('player', 'assets/characters/medico.png');
   this.load.image('tile_floor', 'assets/hospital_tileset/floor.png');
   ```

## 📝 Créditos e Licença

Desenvolvido como projeto educacional gamificado para Anestesiologia.
Assets de arte (referência): Modern Interiors.
