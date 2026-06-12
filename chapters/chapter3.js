/**
 * CHAPTER 3 — Logic
 *
 * init()    — called each time the user enters this chapter
 * destroy() — called when leaving this chapter (cleanup listeners, etc.)
 *
 * Axe 3 — Parallel track frequency transition
 * Web Audio API: synchronized dual-buffer playback + equal-power crossfade
 */

const AUDIO_A = "media/Alex1.mp3";
const AUDIO_B = "media/Xela1.mp3";
const PEAK_COUNT = 512;
const TUNING_BAND = 0.18;

let canvas = null;
let ctx2d = null;
let freqSlider = null;
let wavePanel = null;

let audioCtx = null;
let bufferA = null;
let bufferB = null;
let peaksA = null;
let peaksB = null;

let sourceA = null;
let sourceB = null;
let gainA = null;
let gainB = null;
let filterA = null;
let filterB = null;
let noiseGain = null;
let noiseSource = null;
let masterGain = null;

let mix = 0;
let isPlaying = false;
let playbackStart = 0;
let playbackOffset = 0;
let playbackDuration = 0;
let rafId = 0;
let chapterInitialized = false;
let bootToken = 0;

let onSliderInput = null;
let onSliderPointerdown = null;
let onWaveClick = null;
let onKeydown = null;
let onResize = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

async function loadAudio(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return getContext().decodeAudioData(arrayBuffer);
}

function computePeaks(buffer, count = PEAK_COUNT) {
  const data = buffer.getChannelData(0);
  const block = Math.floor(data.length / count);
  const peaks = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    let max = 0;
    const start = i * block;
    const end = Math.min(start + block, data.length);
    for (let j = start; j < end; j++) {
      const v = Math.abs(data[j]);
      if (v > max) max = v;
    }
    peaks[i] = max;
  }
  return peaks;
}

function buildNoiseBuffer(ctx, seconds = 2) {
  const len = Math.ceil(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  return buf;
}

function createGraph() {
  const ctx = getContext();

  gainA = ctx.createGain();
  gainB = ctx.createGain();
  filterA = ctx.createBiquadFilter();
  filterB = ctx.createBiquadFilter();
  masterGain = ctx.createGain();

  filterA.type = "lowpass";
  filterB.type = "lowpass";
  filterA.frequency.value = 20000;
  filterB.frequency.value = 20000;
  filterA.Q.value = 0.7;
  filterB.Q.value = 0.7;

  noiseGain = ctx.createGain();
  noiseGain.gain.value = 0;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1800;
  noiseFilter.Q.value = 0.4;

  const noiseBuf = buildNoiseBuffer(ctx);
  noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuf;
  noiseSource.loop = true;
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseSource.start(0);

  gainA.connect(filterA);
  filterA.connect(masterGain);
  gainB.connect(filterB);
  filterB.connect(masterGain);
  masterGain.connect(ctx.destination);

  applyMix(0, false);
}

function applyMix(value, ramp = true) {
  mix = Math.max(0, Math.min(1, value));
  const ctx = audioCtx;
  if (!ctx || !gainA) return;

  const t = ctx.currentTime;
  const set = (param, val) => {
    if (ramp) param.setTargetAtTime(val, t, 0.02);
    else param.setValueAtTime(val, t);
  };

  const gA = Math.cos(mix * Math.PI * 0.5);
  const gB = Math.sin(mix * Math.PI * 0.5);
  set(gainA.gain, gA);
  set(gainB.gain, gB);

  const detune = Math.abs(mix - 0.5) * 2;
  const cutoff = 400 + detune * detune * 16000;
  set(filterA.frequency, cutoff);
  set(filterB.frequency, cutoff);

  const tuningAmount = Math.max(0, 1 - Math.abs(mix - 0.5) / TUNING_BAND);
  set(noiseGain.gain, tuningAmount * tuningAmount * 0.06);

  if (freqSlider) freqSlider.value = String(Math.round(mix * 100));
  if (wavePanel) {
    wavePanel.classList.toggle(
      "is-tuning",
      Math.abs(mix - 0.5) < TUNING_BAND && isPlaying
    );
  }
}

function startSourcesAt(offset = 0) {
  const ctx = getContext();
  stopSources(false);

  sourceA = ctx.createBufferSource();
  sourceB = ctx.createBufferSource();
  sourceA.buffer = bufferA;
  sourceB.buffer = bufferB;
  sourceA.loop = true;
  sourceB.loop = true;

  sourceA.connect(gainA);
  sourceB.connect(gainB);

  playbackDuration = Math.min(bufferA.duration, bufferB.duration);
  playbackOffset = Math.max(0, Math.min(offset, playbackDuration - 0.001));

  const when = ctx.currentTime + 0.02;
  sourceA.start(when, playbackOffset % bufferA.duration);
  sourceB.start(when, playbackOffset % bufferB.duration);
  playbackStart = when - playbackOffset;
}

function stopSources(disconnect = true) {
  for (const src of [sourceA, sourceB]) {
    if (!src) continue;
    try {
      src.stop();
    } catch {
      /* already stopped */
    }
    if (disconnect) src.disconnect();
  }
  sourceA = null;
  sourceB = null;
}

async function resumePlayback() {
  const ctx = getContext();
  if (ctx.state === "suspended") await ctx.resume();
  startSourcesAt(playbackOffset);
  isPlaying = true;
  applyMix(mix, false);
  scheduleFrame();
}

function pausePlayback() {
  if (!isPlaying) return;
  playbackOffset = getPlaybackTime();
  stopSources(false);
  isPlaying = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  applyMix(mix, false);
  drawFrame();
}

function togglePlayback() {
  if (isPlaying) pausePlayback();
  else resumePlayback();
}

function seekToRatio(ratio) {
  const clamped = Math.max(0, Math.min(1, ratio));
  playbackOffset =
    clamped >= 1
      ? Math.max(0, playbackDuration - 0.001)
      : clamped * playbackDuration;
  if (isPlaying) startSourcesAt(playbackOffset);
  else drawFrame();
}

function getPlaybackTime() {
  if (!audioCtx || !isPlaying) return playbackOffset;
  if (playbackDuration <= 0) return 0;
  const elapsed = audioCtx.currentTime - playbackStart;
  return ((elapsed % playbackDuration) + playbackDuration) % playbackDuration;
}

function resizeCanvas() {
  if (!canvas || !ctx2d) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawWavePath(peaks, w, h, scale = 0.42) {
  const midY = h * 0.5;
  ctx2d.beginPath();
  for (let i = 0; i < peaks.length; i++) {
    const x = (i / (peaks.length - 1)) * w;
    const amp = peaks[i] * (h * scale);
    const y = midY - amp;
    if (i === 0) ctx2d.moveTo(x, y);
    else ctx2d.lineTo(x, y);
  }
  for (let i = peaks.length - 1; i >= 0; i--) {
    const x = (i / (peaks.length - 1)) * w;
    const amp = peaks[i] * (h * scale);
    ctx2d.lineTo(x, midY + amp);
  }
  ctx2d.closePath();
}

function drawFrame() {
  if (!canvas || !ctx2d) return;
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  if (!w || !h || !peaksA) return;

  const progress =
    playbackDuration > 0
      ? Math.min(1, getPlaybackTime() / playbackDuration)
      : 0;

  const tuning = Math.max(0, 1 - Math.abs(mix - 0.5) / TUNING_BAND);
  const skew = tuning * 0.04 * Math.sin(Date.now() * 0.02);

  ctx2d.clearRect(0, 0, w, h);
  ctx2d.save();

  if (isPlaying && tuning > 0.2) {
    ctx2d.translate(w / 2, h / 2);
    ctx2d.transform(1, skew, 0, 1, -w / 2, -h / 2);
  }

  const midY = h * 0.5;

  drawWavePath(peaksA, w, h);
  ctx2d.fillStyle = "rgba(255,255,255,0.08)";
  ctx2d.fill();

  if (mix > 0.02 && peaksB) {
    ctx2d.save();
    ctx2d.globalAlpha = mix * 0.45;
    drawWavePath(peaksB, w, h, 0.38);
    ctx2d.fillStyle = "#ffffff";
    ctx2d.fill();
    ctx2d.restore();
  }

  const progressX = progress * w;
  ctx2d.save();
  ctx2d.beginPath();
  ctx2d.rect(0, 0, progressX, h);
  ctx2d.clip();
  drawWavePath(peaksA, w, h);
  ctx2d.fillStyle = `rgba(255,255,255,${0.35 + mix * 0.65})`;
  ctx2d.fill();
  ctx2d.restore();

  ctx2d.strokeStyle = "rgba(255,255,255,0.5)";
  ctx2d.lineWidth = 1;
  ctx2d.beginPath();
  ctx2d.moveTo(progressX, 0);
  ctx2d.lineTo(progressX, h);
  ctx2d.stroke();

  ctx2d.fillStyle = "#ffffff";
  ctx2d.beginPath();
  ctx2d.arc(progressX, midY, 3 + tuning * 2, 0, Math.PI * 2);
  ctx2d.fill();

  ctx2d.restore();
}

function scheduleFrame() {
  if (rafId) return;
  const loop = () => {
    drawFrame();
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
}

function setMixFromPercent(pct) {
  applyMix(pct / 100, true);
  if (!isPlaying) drawFrame();
}

function bindEvents() {
  onSliderInput = (e) => setMixFromPercent(Number(e.target.value));

  onSliderPointerdown = async () => {
    if (audioCtx?.state === "suspended") {
      await audioCtx.resume();
      if (!isPlaying) await resumePlayback();
    }
  };

  onWaveClick = async (e) => {
    if (!bufferA || !bufferB || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    if (audioCtx?.state === "suspended") await audioCtx.resume();
    seekToRatio(ratio);
  };

  onKeydown = (e) => {
    if (e.code !== "Space") return;
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type !== "range" &&
      e.target.type !== "button"
    ) {
      return;
    }
    e.preventDefault();
    togglePlayback();
  };

  onResize = () => {
    resizeCanvas();
    drawFrame();
  };

  freqSlider.addEventListener("input", onSliderInput);
  freqSlider.addEventListener("pointerdown", onSliderPointerdown);
  wavePanel.addEventListener("click", onWaveClick);
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", onResize);
}

function unbindEvents() {
  if (freqSlider && onSliderInput) {
    freqSlider.removeEventListener("input", onSliderInput);
    freqSlider.removeEventListener("pointerdown", onSliderPointerdown);
  }
  if (wavePanel && onWaveClick) {
    wavePanel.removeEventListener("click", onWaveClick);
  }
  if (onKeydown) window.removeEventListener("keydown", onKeydown);
  if (onResize) window.removeEventListener("resize", onResize);

  onSliderInput = null;
  onSliderPointerdown = null;
  onWaveClick = null;
  onKeydown = null;
  onResize = null;
}

function stopNoiseSource() {
  if (!noiseSource) return;
  try {
    noiseSource.stop();
  } catch {
    /* already stopped */
  }
  noiseSource.disconnect();
  noiseSource = null;
}

async function bootAudio(token) {
  getContext();
  const [a, b] = await Promise.all([loadAudio(AUDIO_A), loadAudio(AUDIO_B)]);
  if (token !== bootToken) return;

  bufferA = a;
  bufferB = b;
  peaksA = computePeaks(bufferA);
  peaksB = computePeaks(bufferB);
  createGraph();
  playbackDuration = Math.min(bufferA.duration, bufferB.duration);
  resizeCanvas();
  applyMix(0, false);
  drawFrame();
  await resumePlayback();
}

/* ================================================================
   CHAPTER LIFECYCLE — wired to menu.js view switching
   ================================================================ */

function init() {
  if (chapterInitialized) return;

  canvas = document.getElementById("waveCanvas");
  freqSlider = document.getElementById("freqSlider");
  wavePanel = document.querySelector('[data-view="chapter3"] .panel--wave');

  if (!canvas || !freqSlider || !wavePanel) return;

  ctx2d = canvas.getContext("2d");
  bindEvents();
  chapterInitialized = true;

  const token = ++bootToken;
  bootAudio(token).catch((err) => {
    if (token === bootToken) console.error(err);
  });
}

function destroy() {
  bootToken++;
  pausePlayback();
  stopSources(true);
  stopNoiseSource();
  unbindEvents();

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }

  bufferA = null;
  bufferB = null;
  peaksA = null;
  peaksB = null;
  gainA = null;
  gainB = null;
  filterA = null;
  filterB = null;
  noiseGain = null;
  masterGain = null;
  canvas = null;
  ctx2d = null;
  freqSlider = null;
  wavePanel = null;
  mix = 0;
  playbackOffset = 0;
  playbackDuration = 0;
  chapterInitialized = false;
}

window.Chapter3 = { init: init, destroy: destroy };
