# Guia de Exportação Mobile (Capacitor)

Para transformar seu jogo web (Phaser) em um aplicativo nativo (Android/iOS), recomendamos o uso do **Capacitor**.

## Por que Capacitor?
- **Moderno**: Mantido pela equipe do Ionic.
- **Simples**: "Empacota" seu site (`dist/`) em um app webview nativo.
- **Plugins**: Acesso fácil a vibração, status bar, notificações, etc.

## Passo a Passo

### 1. Preparar o Jogo
Certifique-se de que o jogo está rodando bem no navegador móvel (Chrome DevTools).
Gere a versão final:
```bash
npm run build
```
Isso cria a pasta `dist/`.

### 2. Instalar Capacitor
Na raiz do projeto:
```bash
npm install @capacitor/core
npm install -D @capacitor/cli
npx cap init
```
- Responda as perguntas (Nome: Jogo Anest, ID: com.prisco.jogoanest).

### 3. Adicionar Plataformas
```bash
npm install @capacitor/android
npx cap add android
# Para iOS (precisa de Mac)
npm install @capacitor/ios
npx cap add ios
```

### 4. Sincronizar
Sempre que fizer `npm run build`, rode:
```bash
npx cap sync
```

### 5. Abrir e Compilar
```bash
npx cap open android
```
Isso abrirá o **Android Studio**. De lá, você pode rodar o emulador ou conectar seu celular via USB e clicar em "Run".

Para iOS:
```bash
npx cap open ios
```
Isso abrirá o **Xcode**.

## Dicas de Qualidade ("Ficar Legal")
- **Ícone e Splash Screen**: Use a ferramenta `@capacitor/assets` para gerar automaticamente todos os ícones.
- **Fullscreen**: No `main.ts` do Phaser, use `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }` (já configuramos isso).
- **Sem Zoom**: No `index.html`, garanta que a meta tag viewport impeça zoom do usuário (já configuramos `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`).

---
**Status Atual**: O projeto está pronto para o passo 1 e 2. Se quiser, posso rodar a instalação do Capacitor agora.
