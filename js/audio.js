// Tiny chiptune + SFX engine. Pure Web Audio, zero assets.
window.SFX = (function () {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let sfxGain = null;
  let enabled = false;
  let musicOn = false;
  let loopHandle = null;
  let step = 0;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.0;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.5;
    sfxGain.connect(master);
    enabled = true;
  }

  function resume() {
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  // Single blip.
  function tone(freq, dur, type, gainNode, when, vol) {
    if (!enabled) return;
    const t = when || ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(gainNode || sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  // --- Sound effects ---
  function blip() { tone(660, 0.08, "square", sfxGain, 0, 0.25); }
  function move() { tone(220, 0.05, "square", sfxGain, 0, 0.12); }
  function bump() { tone(90, 0.12, "sawtooth", sfxGain, 0, 0.2); }
  function confirm() {
    tone(523, 0.07, "square", sfxGain, 0, 0.25);
    tone(784, 0.09, "square", sfxGain, ctx.currentTime + 0.07, 0.25);
  }
  function back() { tone(440, 0.07, "square", sfxGain, 0, 0.22); }
  function open() {
    tone(330, 0.06, "square", sfxGain, 0, 0.22);
    tone(494, 0.06, "square", sfxGain, ctx.currentTime + 0.06, 0.22);
    tone(659, 0.08, "square", sfxGain, ctx.currentTime + 0.12, 0.22);
  }
  function achievement() {
    const seq = [523, 659, 784, 1047];
    seq.forEach((f, i) => tone(f, 0.12, "square", sfxGain, ctx.currentTime + i * 0.1, 0.28));
  }
  function coin() {
    tone(988, 0.06, "square", sfxGain, 0, 0.25);
    tone(1319, 0.1, "square", sfxGain, ctx.currentTime + 0.06, 0.25);
  }
  function error() {
    tone(160, 0.18, "sawtooth", sfxGain, 0, 0.25);
  }
  function start() {
    const seq = [392, 523, 659, 784, 1047];
    seq.forEach((f, i) => tone(f, 0.14, "square", sfxGain, ctx.currentTime + i * 0.09, 0.3));
  }

  // --- Background music: a looping arpeggio + bass line ---
  // Notes (Hz). A minor-ish adventurous progression.
  const melody = [
    220, 262, 330, 392, 330, 262, 330, 392,
    196, 247, 294, 392, 294, 247, 294, 392,
    175, 220, 262, 330, 262, 220, 262, 330,
    196, 247, 294, 370, 294, 247, 294, 370,
  ];
  const bass = [110, 110, 98, 98, 87, 87, 98, 98];

  function musicStep() {
    if (!enabled || !musicOn) return;
    const t = ctx.currentTime;
    const note = melody[step % melody.length];
    tone(note, 0.18, "square", musicGain, t, 0.16);
    if (step % 4 === 0) {
      const b = bass[(step / 4) % bass.length | 0];
      tone(b, 0.5, "triangle", musicGain, t, 0.22);
    }
    if (step % 2 === 0) {
      tone(note * 2, 0.1, "square", musicGain, t + 0.12, 0.06);
    }
    step++;
  }

  function startMusic() {
    if (!enabled || musicOn) return;
    musicOn = true;
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
    if (loopHandle) clearInterval(loopHandle);
    loopHandle = setInterval(musicStep, 180);
  }

  function stopMusic() {
    if (!enabled) return;
    musicOn = false;
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.4);
    if (loopHandle) { clearInterval(loopHandle); loopHandle = null; }
  }

  function toggleMusic() {
    init();
    resume();
    if (musicOn) { stopMusic(); return false; }
    startMusic(); return true;
  }

  function isMusicOn() { return musicOn; }

  return {
    init, resume,
    blip, move, bump, confirm, back, open, achievement, coin, error, start,
    toggleMusic, isMusicOn, startMusic, stopMusic,
  };
})();
