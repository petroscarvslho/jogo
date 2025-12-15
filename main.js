const canvas = document.getElementById('us-canvas');
const ctx = canvas.getContext('2d'); // iOS-friendly (no alpha flag)
const probeTip = document.getElementById('probe-tip');

// UI elements
const gainSlider = document.getElementById('gain');
const depthSlider = document.getElementById('depth');
const pressSlider = document.getElementById('press');
const tiltSlider = document.getElementById('tilt');
const gainVal = document.getElementById('gainVal');
const depthVal = document.getElementById('depthVal');
const pressVal = document.getElementById('pressVal');
const tiltVal = document.getElementById('tiltVal');
const scoreEl = document.getElementById('score');

const BASE_WIDTH = 600;
const BASE_HEIGHT = 360;
const renderScale = window.devicePixelRatio > 2 ? 0.65 : 0.8;
const buffer = document.createElement('canvas');
const bufferCtx = buffer.getContext('2d');

let renderWidth = Math.round(BASE_WIDTH * renderScale);
let renderHeight = Math.round(BASE_HEIGHT * renderScale);
buffer.width = renderWidth;
buffer.height = renderHeight;

const state = {
  probeX: BASE_WIDTH * 0.58,
  probeY: BASE_HEIGHT * 0.54,
  gain: parseFloat(gainSlider.value),
  depth: parseFloat(depthSlider.value),
  press: parseFloat(pressSlider.value),
  tilt: parseFloat(tiltSlider.value),
  time: 0,
  dragging: false,
};

const target = {
  artery: { x: BASE_WIDTH * 0.52, y: BASE_HEIGHT * 0.55, baseR: 26 },
  plexus: { x: BASE_WIDTH * 0.68, y: BASE_HEIGHT * 0.53 },
  rib: { y: BASE_HEIGHT * 0.7 },
  pleura: { y: BASE_HEIGHT * 0.78 },
};

const speckle = createSpeckleTexture(128, 128);

function createSpeckleTexture(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const sctx = c.getContext('2d');
  const imgData = sctx.createImageData(w, h);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = Math.random() * 255;
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 255;
  }
  sctx.putImageData(imgData, 0, 0);
  return c;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mapDepth(y) {
  return y * state.depth;
}

function drawLayer(ctx2d, color, y, thickness, alpha = 1) {
  ctx2d.save();
  ctx2d.globalAlpha = alpha;
  ctx2d.fillStyle = color;
  ctx2d.fillRect(0, y, renderWidth, thickness);
  ctx2d.restore();
}

function drawSkinAndMuscle() {
  const ctx2d = bufferCtx;
  const depthOffset = state.press * 8;
  const skinY = mapDepth(12) + depthOffset;
  drawLayer(ctx2d, '#f6f7fa', skinY, 3, 0.9);
  drawLayer(ctx2d, '#d3d9e6', skinY + 3, 6, 0.45);
  drawLayer(ctx2d, '#9aa4b4', skinY + 10, 12, 0.25);

  const muscleTop = mapDepth(40) + depthOffset * 1.3;
  const muscleHeight = mapDepth(120);
  for (let i = 0; i < 14; i++) {
    const stripeY = muscleTop + (i / 14) * muscleHeight;
    const alpha = 0.08 + 0.05 * Math.sin((i + state.time * 0.0008));
    drawLayer(ctx2d, '#70829c', stripeY, 5, alpha);
  }
}

function drawArtery() {
  const ctx2d = bufferCtx;
  const pulsate = Math.sin(state.time * 0.005) * 3;
  const r = (target.artery.baseR + pulsate) * (0.85 + 0.2 * (1 - state.press));
  const x = target.artery.x + (state.probeX - BASE_WIDTH / 2) * 0.35;
  const y = mapDepth(target.artery.y) + state.press * 10;
  ctx2d.save();
  ctx2d.translate(x * renderScale, y * renderScale);
  ctx2d.scale(renderScale, renderScale);
  ctx2d.beginPath();
  ctx2d.fillStyle = '#04070a';
  ctx2d.strokeStyle = '#f6f8ff';
  ctx2d.lineWidth = 4;
  ctx2d.arc(0, 0, r, 0, Math.PI * 2);
  ctx2d.fill();
  ctx2d.stroke();
  ctx2d.restore();
}

function drawPlexus() {
  const ctx2d = bufferCtx;
  const baseX = target.plexus.x + (state.probeX - BASE_WIDTH / 2) * 0.4;
  const baseY = mapDepth(target.plexus.y) + state.press * 8;
  const nodes = 8;
  for (let i = 0; i < nodes; i++) {
    const angle = (Math.PI * 2 * i) / nodes;
    const radius = 18 + 3 * Math.sin(state.time * 0.004 + i);
    const nx = baseX + Math.cos(angle) * 18;
    const ny = baseY + Math.sin(angle * 1.2) * 12;
    ctx2d.save();
    ctx2d.translate(nx * renderScale, ny * renderScale);
    ctx2d.scale(renderScale, renderScale);
    ctx2d.beginPath();
    ctx2d.fillStyle = 'rgba(220, 232, 250, 0.08)';
    ctx2d.strokeStyle = 'rgba(220, 232, 250, 0.7)';
    ctx2d.lineWidth = 2.5;
    ctx2d.arc(0, 0, radius, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.stroke();
    ctx2d.restore();
  }
}

function drawRibAndPleura() {
  const ctx2d = bufferCtx;
  const tiltShift = state.tilt * 0.4;
  const ribY = mapDepth(target.rib.y) + state.press * 12;
  const pleuraY = mapDepth(target.pleura.y) + state.press * 14 + Math.sin(state.time * 0.001 + state.tilt) * 2;

  ctx2d.save();
  ctx2d.strokeStyle = 'rgba(235, 240, 255, 0.9)';
  ctx2d.lineWidth = 4;
  ctx2d.beginPath();
  ctx2d.moveTo(0, (ribY - tiltShift) * renderScale);
  ctx2d.lineTo(renderWidth, (ribY + tiltShift) * renderScale);
  ctx2d.stroke();
  ctx2d.restore();

  ctx2d.save();
  const gradient = ctx2d.createLinearGradient(0, pleuraY * renderScale, 0, renderHeight);
  gradient.addColorStop(0, 'rgba(180, 220, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(10, 12, 16, 0)');
  ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx2d.lineWidth = 3;
  ctx2d.beginPath();
  ctx2d.moveTo(0, (pleuraY - tiltShift * 0.6) * renderScale);
  ctx2d.lineTo(renderWidth, (pleuraY + tiltShift * 0.6) * renderScale);
  ctx2d.stroke();
  ctx2d.globalCompositeOperation = 'source-over';
  ctx2d.fillStyle = gradient;
  ctx2d.fillRect(0, pleuraY * renderScale, renderWidth, renderHeight - pleuraY * renderScale);
  ctx2d.restore();

  ctx2d.save();
  ctx2d.globalCompositeOperation = 'multiply';
  ctx2d.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx2d.fillRect(0, (ribY + 6) * renderScale, renderWidth, renderHeight - (ribY + 6) * renderScale);
  ctx2d.restore();
}

function drawSpeckle() {
  const ctx2d = bufferCtx;
  const pattern = ctx2d.createPattern(speckle, 'repeat');
  ctx2d.save();
  ctx2d.globalAlpha = 0.15 * state.gain;
  ctx2d.globalCompositeOperation = 'overlay';
  ctx2d.translate((state.time * 0.03) % speckle.width, (state.time * 0.05) % speckle.height);
  ctx2d.fillStyle = pattern;
  ctx2d.fillRect(-speckle.width, -speckle.height, renderWidth + speckle.width * 2, renderHeight + speckle.height * 2);
  ctx2d.restore();
}

function drawScanLines() {
  const ctx2d = bufferCtx;
  ctx2d.save();
  ctx2d.globalAlpha = 0.35;
  ctx2d.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx2d.lineWidth = 1;
  for (let y = 0; y < renderHeight; y += 6) {
    ctx2d.beginPath();
    ctx2d.moveTo(0, y + ((state.tilt / 20) * 4));
    ctx2d.lineTo(renderWidth, y - ((state.tilt / 20) * 4));
    ctx2d.stroke();
  }
  ctx2d.restore();
}

function drawGradientBackground() {
  const ctx2d = bufferCtx;
  const gradient = ctx2d.createLinearGradient(0, 0, 0, renderHeight);
  gradient.addColorStop(0, '#0b0e14');
  gradient.addColorStop(1, '#06080d');
  ctx2d.fillStyle = gradient;
  ctx2d.fillRect(0, 0, renderWidth, renderHeight);
}

function drawDepthMarkers() {
  const ctx2d = bufferCtx;
  ctx2d.save();
  ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx2d.fillStyle = 'rgba(255,255,255,0.4)';
  ctx2d.lineWidth = 1;
  const steps = 4;
  for (let i = 1; i <= steps; i++) {
    const y = (renderHeight / steps) * i;
    ctx2d.beginPath();
    ctx2d.moveTo(renderWidth - 20, y);
    ctx2d.lineTo(renderWidth, y);
    ctx2d.stroke();
    ctx2d.fillText(`${i} cm`, renderWidth - 48, y + 4);
  }
  ctx2d.restore();
}

function computeScore() {
  const probeVectorX = state.probeX - target.plexus.x;
  const probeVectorY = (state.probeY - target.plexus.y) * 1.3;
  const dist = Math.sqrt(probeVectorX * probeVectorX + probeVectorY * probeVectorY);
  const proximityScore = Math.max(0, 600 - dist * 3);
  const arteryVisible = Math.abs(state.probeX - target.artery.x) < 120 ? 200 : 0;
  const tiltPenalty = Math.max(0, Math.abs(state.tilt) - 8) * 6;
  const score = Math.max(0, Math.min(1000, Math.round(proximityScore + arteryVisible - tiltPenalty)));
  return score;
}

function updateProbeTip() {
  const rect = canvas.getBoundingClientRect();
  const percentX = state.probeX / BASE_WIDTH;
  const percentY = state.probeY / BASE_HEIGHT;
  probeTip.style.left = `${rect.left + rect.width * percentX}px`;
  probeTip.style.top = `${rect.top + rect.height * percentY}px`;
}

function updateUIValues() {
  gainVal.textContent = `${state.gain.toFixed(2)}x`;
  depthVal.textContent = `${state.depth.toFixed(2)}x`;
  pressVal.textContent = `${Math.round(state.press * 100)}%`;
  tiltVal.textContent = `${state.tilt.toFixed(1)}°`;
  scoreEl.textContent = `Score: ${computeScore().toString().padStart(4, '0')}`;
}

function render() {
  state.time += 16;
  bufferCtx.clearRect(0, 0, renderWidth, renderHeight);
  drawGradientBackground();
  drawSkinAndMuscle();
  drawArtery();
  drawPlexus();
  drawRibAndPleura();
  drawSpeckle();
  drawScanLines();
  drawDepthMarkers();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(buffer, 0, 0, renderWidth, renderHeight, 0, 0, canvas.width, canvas.height);

  updateProbeTip();
  updateUIValues();
  requestAnimationFrame(render);
}

function handlePointer(evt) {
  evt.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = ((evt.clientX || evt.touches?.[0]?.clientX) - rect.left) / rect.width * BASE_WIDTH;
  const y = ((evt.clientY || evt.touches?.[0]?.clientY) - rect.top) / rect.height * BASE_HEIGHT;
  state.probeX = Math.min(Math.max(x, 20), BASE_WIDTH - 20);
  state.probeY = Math.min(Math.max(y, 40), BASE_HEIGHT - 20);
}

canvas.addEventListener('pointerdown', (e) => {
  state.dragging = true;
  handlePointer(e);
});
canvas.addEventListener('pointermove', (e) => {
  if (state.dragging) handlePointer(e);
});
window.addEventListener('pointerup', () => (state.dragging = false));
window.addEventListener('pointercancel', () => (state.dragging = false));

[gainSlider, depthSlider, pressSlider, tiltSlider].forEach((slider) => {
  slider.addEventListener('input', () => {
    state.gain = parseFloat(gainSlider.value);
    state.depth = parseFloat(depthSlider.value);
    state.press = parseFloat(pressSlider.value);
    state.tilt = parseFloat(tiltSlider.value);
  });
});

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.2);
  const { width } = canvas.getBoundingClientRect();
  const scale = dpr;
  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;
  renderWidth = Math.round(BASE_WIDTH * renderScale);
  renderHeight = Math.round(BASE_HEIGHT * renderScale);
  buffer.width = renderWidth;
  buffer.height = renderHeight;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateUIValues();
requestAnimationFrame(render);
