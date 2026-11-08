(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const H = 6.62607015e-34;
  const ME = 9.1093837015e-31;
  const TAU = Math.PI * 2;
  const REDUCED = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PALETTE = {
    ink: '#211f1c',
    ink2: '#3b3732',
    muted: '#6d675f',
    paper: '#f3f0e7',
    paper2: '#e8e3d7',
    rule: '#b8b1a2',
    accent: '#a63d2f',
    accentSoft: 'rgba(166, 61, 47, 0.14)',
    blue: '#2f6f9f',
    blueSoft: 'rgba(47, 111, 159, 0.14)',
    green: '#4f7a4a',
    gold: '#a9852c'
  };

  const SUP = {
    '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };

  const fmt = (n, digits = 2) => new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  }).format(n);

  const fmtFixed = (n, digits = 2) => new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(n);

  function sci(n, digits = 2) {
    if (!Number.isFinite(n)) return '–';
    if (n === 0) return '0';
    const sign = n < 0 ? '−' : '';
    const abs = Math.abs(n);
    const exp = Math.floor(Math.log10(abs));
    const mant = abs / (10 ** exp);
    const sup = String(exp).split('').map((ch) => SUP[ch] || ch).join('');
    return `${sign}${fmtFixed(mant, digits)}·10${sup}`;
  }

  function unitLength(m) {
    if (m >= 1e-9) return `${fmt(m * 1e9, 2)} nm`;
    if (m >= 1e-12) return `${fmt(m * 1e12, 1)} pm`;
    return `${fmt(m * 1e15, 1)} fm`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function canvasIn(stage, logicalW = 720, logicalH = 360) {
    const canvas = $('canvas', stage) || document.createElement('canvas');
    if (!canvas.parentNode) stage.append(canvas);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.aspectRatio = `${logicalW} / ${logicalH}`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { canvas, ctx, w: logicalW, h: logicalH };
  }

  function sliderRow({ label, min, max, step, value, format, onInput }) {
    const row = make('div', 'slider-row');
    const labelEl = make('label', '', label);
    const output = document.createElement('output');
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.id = `q12-range-${sliderRow._id = (sliderRow._id || 0) + 1}`;
    labelEl.htmlFor = input.id;
    output.textContent = format(value);
    input.addEventListener('input', () => {
      const v = Number(input.value);
      output.textContent = format(v);
      onInput(v);
    });
    row.append(labelEl, output, input);
    return { row, input, output, set(v, silent = true) {
      input.value = String(v);
      output.textContent = format(v);
      if (!silent) onInput(v);
    } };
  }

  function segControl(options, value, onChange, ariaLabel) {
    const wrap = make('div', 'seg');
    wrap.setAttribute('role', 'group');
    if (ariaLabel) wrap.setAttribute('aria-label', ariaLabel);
    options.forEach((option) => {
      const button = make('button', '', option.label);
      button.type = 'button';
      button.dataset.value = option.value;
      button.setAttribute('aria-pressed', String(option.value === value));
      button.addEventListener('click', () => {
        $$('button', wrap).forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        onChange(option.value);
      });
      wrap.append(button);
    });
    return wrap;
  }

  function actionButton(label, onClick, variant = 'btn btn--quiet btn--small') {
    const button = make('button', variant, label);
    button.type = 'button';
    button.addEventListener('click', onClick);
    return button;
  }

  function readoutItem(label, value) {
    const span = document.createElement('span');
    span.append(make('span', '', label), make('b', '', value));
    return span;
  }

  function label(ctx, text, x, y, color = PALETTE.muted, size = 12, align = 'left') {
    ctx.save();
    ctx.font = `500 ${size}px "Libre Franklin", ui-sans-serif, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function dashedLine(ctx, x1, y1, x2, y2, color = PALETTE.rule, dash = [5, 4]) {
    ctx.save();
    ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------------------------------------------------------------
     Doppelspalt
  --------------------------------------------------------------- */
  function initDoubleSlit(root) {
    const controls = $('[data-tool-controls]', root);
    const stage = $('[data-tool-stage]', root);
    const readout = $('[data-tool-readout]', root);
    const fallback = $('.tool__fallback', stage);
    if (fallback) fallback.remove();
    if (!controls || !stage || !readout) return;

    const { ctx, w: W, h: Hc } = canvasIn(stage);
    const state = {
      lambda: 650,
      d: 0.25,
      L: 0.6,
      mode: 'beides',
      hits: [],
      phase: 0,
      last: 0
    };

    const sourceX = 52;
    const barrierX = 300;
    const screenX = 640;
    const top = 44;
    const bottom = 316;
    const midY = 180;
    const screenRangeMm = 20;

    const yToMm = (y) => ((y - midY) / (bottom - top)) * screenRangeMm;
    const mmToY = (mm) => midY + (mm / screenRangeMm) * (bottom - top);

    function lambdaM() { return state.lambda * 1e-9; }
    function dM() { return state.d * 1e-3; }
    function slitWidthM() { return 0.02e-3; }

    function intensityAt(mm) {
      const y = mm * 1e-3;
      const arg = Math.PI * dM() * y / (lambdaM() * state.L);
      const interference = Math.cos(arg) ** 2;
      const x = Math.PI * slitWidthM() * y / (lambdaM() * state.L);
      const envelope = x === 0 ? 1 : (Math.sin(x) / x) ** 2;
      return interference * envelope;
    }

    let dist = new Float64Array(320);
    let distSum = 1;

    function rebuildDistribution() {
      const bins = dist.length;
      let sum = 0;
      for (let i = 0; i < bins; i += 1) {
        const mm = -screenRangeMm / 2 + ((i + 0.5) / bins) * screenRangeMm;
        const value = intensityAt(mm);
        dist[i] = value;
        sum += value;
      }
      distSum = sum > 0 ? sum : 1;
    }

    function sampleMm() {
      let r = Math.random() * distSum;
      for (let i = 0; i < dist.length; i += 1) {
        r -= dist[i];
        if (r <= 0) {
          return -screenRangeMm / 2 + ((i + Math.random()) / dist.length) * screenRangeMm;
        }
      }
      return 0;
    }

    function addHits(n) {
      for (let i = 0; i < n; i += 1) state.hits.push(sampleMm());
      updateReadout();
      draw();
    }

    function clearHits() {
      state.hits = [];
      updateReadout();
      draw();
    }

    function fringeSpacingMm() {
      return (lambdaM() * state.L / dM()) * 1000;
    }

    function updateReadout() {
      readout.replaceChildren(
        readoutItem('Streifenabstand Δy', `${fmt(fringeSpacingMm(), 2)} mm`),
        readoutItem('Treffer', String(state.hits.length)),
        readoutItem('Wellenlänge', `${fmt(state.lambda, 0)} nm`)
      );
    }

    function drawBarrier() {
      const slitPx = 28 + ((state.d - 0.1) / 0.4) * 56;
      const y1 = midY - slitPx / 2;
      const y2 = midY + slitPx / 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 10;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(barrierX, top);
      ctx.lineTo(barrierX, y1 - 5);
      ctx.moveTo(barrierX, y1 + 5);
      ctx.lineTo(barrierX, y2 - 5);
      ctx.moveTo(barrierX, y2 + 5);
      ctx.lineTo(barrierX, bottom);
      ctx.stroke();
      ctx.strokeStyle = PALETTE.rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(barrierX - 8, y1);
      ctx.lineTo(barrierX + 8, y1);
      ctx.moveTo(barrierX - 8, y2);
      ctx.lineTo(barrierX + 8, y2);
      ctx.stroke();
      return { y1, y2 };
    }

    function drawWavefronts(slits) {
      if (state.mode === 'treffer') return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(barrierX + 5, top, screenX - barrierX - 8, bottom - top);
      ctx.clip();
      const maxR = screenX - barrierX + 80;
      const step = 22;
      const offset = (state.phase * 26) % step;
      const alpha = state.mode === 'beides' ? 0.18 : 0.3;
      [slits.y1, slits.y2].forEach((slitY, index) => {
        ctx.strokeStyle = index === 0
          ? `rgba(166, 61, 47, ${alpha})`
          : `rgba(47, 111, 159, ${alpha})`;
        ctx.lineWidth = 1.3;
        for (let r = offset; r < maxR; r += step) {
          if (r < 1) continue;
          ctx.beginPath();
          ctx.arc(barrierX, slitY, r, 0, TAU);
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    function drawIntensityProfile() {
      ctx.save();
      ctx.strokeStyle = state.mode === 'treffer' ? 'rgba(47, 111, 159, 0.25)' : 'rgba(47, 111, 159, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = top; y <= bottom; y += 1) {
        const i = intensityAt(yToMm(y));
        const x = screenX + 5 + i * 40;
        if (y === top) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, Hc);
      ctx.fillStyle = PALETTE.paper;
      ctx.fillRect(0, 0, W, Hc);

      // source
      ctx.fillStyle = PALETTE.accent;
      ctx.beginPath();
      ctx.arc(sourceX, midY, 8, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = PALETTE.accentSoft;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(sourceX, midY, 14, 0, TAU);
      ctx.stroke();

      // screen
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(screenX, top);
      ctx.lineTo(screenX, bottom);
      ctx.stroke();

      const slits = drawBarrier();
      drawWavefronts(slits);
      drawIntensityProfile();

      // hits
      state.hits.forEach((mm) => {
        const y = mmToY(mm);
        ctx.fillStyle = 'rgba(166, 61, 47, 0.82)';
        ctx.beginPath();
        ctx.arc(screenX + 7 + Math.random() * 5, y, 2.3, 0, TAU);
        ctx.fill();
      });

      // labels
      label(ctx, 'Quelle', sourceX - 18, midY + 26);
      label(ctx, 'Doppelspalt', barrierX - 38, 26);
      label(ctx, 'Schirm', screenX - 14, 26);
      label(ctx, `λ = ${fmt(state.lambda, 0)} nm`, 18, 22, PALETTE.ink, 13);
      label(ctx, `Δy ≈ ${fmt(fringeSpacingMm(), 2)} mm`, 18, 40, PALETTE.ink, 13);

      // small ruler
      ctx.strokeStyle = PALETTE.rule;
      ctx.lineWidth = 1;
      for (let mm = -8; mm <= 8; mm += 2) {
        const y = mmToY(mm);
        ctx.beginPath();
        ctx.moveTo(screenX + 2, y);
        ctx.lineTo(screenX + 8, y);
        ctx.stroke();
      }
    }

    let raf = null;
    function frame(now) {
      if (!state.last) state.last = now;
      const dt = Math.min((now - state.last) / 1000, 0.05);
      state.last = now;
      state.phase += dt;
      draw();
      raf = requestAnimationFrame(frame);
    }

    // controls
    const wavelength = sliderRow({
      label: 'Wellenlänge λ',
      min: 400,
      max: 700,
      step: 1,
      value: state.lambda,
      format: (v) => `${fmt(v, 0)} nm`,
      onInput: (v) => {
        state.lambda = v;
        rebuildDistribution();
        clearHits();
      }
    });
    const separation = sliderRow({
      label: 'Spaltabstand d',
      min: 0.10,
      max: 0.50,
      step: 0.01,
      value: state.d,
      format: (v) => `${fmt(v, 2)} mm`,
      onInput: (v) => {
        state.d = v;
        rebuildDistribution();
        clearHits();
      }
    });
    const distance = sliderRow({
      label: 'Schirmabstand L',
      min: 0.40,
      max: 0.80,
      step: 0.01,
      value: state.L,
      format: (v) => `${fmt(v, 2)} m`,
      onInput: (v) => {
        state.L = v;
        rebuildDistribution();
        clearHits();
      }
    });

    const mode = segControl([
      { value: 'welle', label: 'Welle' },
      { value: 'treffer', label: 'Treffer' },
      { value: 'beides', label: 'Beides' }
    ], state.mode, (value) => {
      state.mode = value;
      draw();
    }, 'Darstellung wählen');

    const sliderGrid = make('div', 'tool-sliders');
    sliderGrid.append(wavelength.row, separation.row, distance.row);
    const actions = make('div', 'tool-actions');
    actions.append(
      actionButton('10 Teilchen', () => addHits(10)),
      actionButton('100 Teilchen', () => addHits(100)),
      actionButton('Zurücksetzen', clearHits)
    );
    controls.append(sliderGrid, mode, actions);

    rebuildDistribution();
    updateReadout();
    draw();

    if (!REDUCED) raf = requestAnimationFrame(frame);
    // Keep the animation alive only while the tool is visible.
    if (typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !REDUCED && !raf) {
            state.last = 0;
            raf = requestAnimationFrame(frame);
          } else if (!entry.isIntersecting && raf) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        });
      }, { threshold: 0.05 });
      observer.observe(root);
    }
  }

  /* ---------------------------------------------------------------
     Einzelteilchen
  --------------------------------------------------------------- */
  function initSingleParticle(root) {
    const controls = $('[data-tool-controls]', root);
    const stage = $('[data-tool-stage]', root);
    const readout = $('[data-tool-readout]', root);
    const status = $('[data-tool-status]', root);
    const fallback = $('.tool__fallback', stage);
    if (fallback) fallback.remove();
    if (!controls || !stage || !readout) return;

    const { ctx, w: W, h: Hc } = canvasIn(stage);
    const state = {
      lambda: 650,
      d: 0.15,
      L: 0.6,
      whichPath: false,
      showWave: true,
      counts: new Array(28).fill(0),
      total: 0,
      packets: [],
      auto: false,
      emitAcc: 0,
      last: 0
    };

    const sourceX = 58;
    const barrierX = 246;
    const screenX = 420;
    const histX = 520;
    const histW = 160;
    const top = 48;
    const bottom = 312;
    const midY = 180;
    const rangeMm = 12;

    const yToMm = (y) => ((y - midY) / (bottom - top)) * rangeMm;
    const mmToY = (mm) => midY + (mm / rangeMm) * (bottom - top);

    function lambdaM() { return state.lambda * 1e-9; }
    function dM() { return state.d * 1e-3; }
    function slitWidthM() { return 0.02e-3; }

    function intensityAt(mm) {
      const y = mm * 1e-3;
      const x = Math.PI * slitWidthM() * y / (lambdaM() * state.L);
      const envelope = x === 0 ? 1 : (Math.sin(x) / x) ** 2;
      if (state.whichPath) return envelope;
      const arg = Math.PI * dM() * y / (lambdaM() * state.L);
      return Math.cos(arg) ** 2 * envelope;
    }

    let dist = new Float64Array(320);
    let distSum = 1;

    function rebuildDistribution() {
      let sum = 0;
      for (let i = 0; i < dist.length; i += 1) {
        const mm = -rangeMm / 2 + ((i + 0.5) / dist.length) * rangeMm;
        const value = intensityAt(mm);
        dist[i] = value;
        sum += value;
      }
      distSum = sum > 0 ? sum : 1;
    }

    function sampleMm() {
      let r = Math.random() * distSum;
      for (let i = 0; i < dist.length; i += 1) {
        r -= dist[i];
        if (r <= 0) {
          return -rangeMm / 2 + ((i + Math.random()) / dist.length) * rangeMm;
        }
      }
      return 0;
    }

    function addHit(mm) {
      state.total += 1;
      const index = clamp(Math.floor(((mm + rangeMm / 2) / rangeMm) * state.counts.length), 0, state.counts.length - 1);
      state.counts[index] += 1;
      updateReadout();
      updateStatus();
    }

    function emit(count = 1) {
      for (let i = 0; i < count; i += 1) {
        const target = sampleMm();
        if (REDUCED) {
          addHit(target);
        } else {
          state.packets.push({ t: -i * 0.06, target });
        }
      }
      draw();
    }

    function clear() {
      state.counts.fill(0);
      state.total = 0;
      state.packets = [];
      updateReadout();
      updateStatus();
      draw();
    }

    function updateReadout() {
      const label = state.total < 8 ? 'schwach' : state.total < 35 ? 'im Aufbau' : 'deutlich';
      readout.replaceChildren(
        readoutItem('Treffer', String(state.total)),
        readoutItem('Muster', label),
        readoutItem('Welcher-Weg', state.whichPath ? 'an' : 'aus')
      );
    }

    function updateStatus() {
      if (!status) return;
      if (state.total === 0) {
        status.textContent = 'Noch kein Treffer. Sende ein Teilchen und beobachte, wo es auftrifft.';
      } else if (state.total < 8) {
        status.textContent = 'Einzelne Treffer – ein Muster ist noch nicht erkennbar.';
      } else if (state.total < 35) {
        status.textContent = 'Die Verteilung wird langsam sichtbar. Noch sind die Ränder unsicher.';
      } else if (state.whichPath) {
        status.textContent = 'Mit Welcher-Weg-Information verschwinden die feinen Interferenzstreifen; es bleibt die breite Hüllkurve.';
      } else {
        status.textContent = 'Das Muster ist deutlich. Viele gleiche Messungen ergeben die Wahrscheinlichkeitsverteilung |ψ|².';
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, Hc);
      ctx.fillStyle = PALETTE.paper;
      ctx.fillRect(0, 0, W, Hc);

      // source
      ctx.fillStyle = PALETTE.accent;
      ctx.beginPath();
      ctx.arc(sourceX, midY, 8, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = PALETTE.accentSoft;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(sourceX, midY, 14, 0, TAU);
      ctx.stroke();

      // barrier
      const slitPx = 30 + ((state.d - 0.1) / 0.4) * 56;
      const y1 = midY - slitPx / 2;
      const y2 = midY + slitPx / 2;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(barrierX, top);
      ctx.lineTo(barrierX, y1 - 5);
      ctx.moveTo(barrierX, y1 + 5);
      ctx.lineTo(barrierX, y2 - 5);
      ctx.moveTo(barrierX, y2 + 5);
      ctx.lineTo(barrierX, bottom);
      ctx.stroke();

      // detector screen
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(screenX, top);
      ctx.lineTo(screenX, bottom);
      ctx.stroke();

      // |psi|^2 curve
      if (state.showWave) {
        ctx.save();
        ctx.strokeStyle = 'rgba(47, 111, 159, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (let y = top; y <= bottom; y += 1) {
          const intensity = intensityAt(yToMm(y));
          const x = screenX + 4 + intensity * 80;
          if (y === top) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
        label(ctx, '|ψ|²', screenX + 62, top - 12, PALETTE.blue, 11);
      }

      // hits on screen
      const maxCount = Math.max(1, ...state.counts);
      state.counts.forEach((count, index) => {
        if (!count) return;
        const y = top + ((index + 0.5) / state.counts.length) * (bottom - top);
        for (let i = 0; i < Math.min(count, 18); i += 1) {
          ctx.fillStyle = 'rgba(166, 61, 47, 0.75)';
          ctx.beginPath();
          ctx.arc(screenX + 3 + Math.random() * 8, y + (Math.random() - 0.5) * 4, 1.8, 0, TAU);
          ctx.fill();
        }
      });

      // histogram
      const histTop = top;
      const histBottom = bottom;
      const histHeight = histBottom - histTop;
      ctx.strokeStyle = PALETTE.rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(histX, histTop);
      ctx.lineTo(histX, histBottom);
      ctx.stroke();
      ctx.fillStyle = 'rgba(166, 61, 47, 0.32)';
      state.counts.forEach((count, index) => {
        if (!count) return;
        const y = histTop + (index / state.counts.length) * histHeight;
        const binH = histHeight / state.counts.length - 1;
        ctx.fillRect(histX + 1, y, (count / maxCount) * histW, Math.max(1, binH));
      });
      label(ctx, 'Treffer', histX + 2, top - 14, PALETTE.ink, 12);
      label(ctx, 'Schirm', screenX - 12, top - 14, PALETTE.ink, 12);

      // moving packets
      state.packets.forEach((packet) => {
        if (packet.t < 0) return;
        const p = clamp(packet.t, 0, 1);
        const x = sourceX + p * (screenX - sourceX);
        const y = midY + p * (mmToY(packet.target) - midY);
        ctx.fillStyle = 'rgba(47, 111, 159, 0.85)';
        ctx.beginPath();
        ctx.arc(x, y, 4.2, 0, TAU);
        ctx.fill();
      });

      label(ctx, 'Quelle', sourceX - 18, midY + 26);
      label(ctx, 'Doppelspalt', barrierX - 34, 24);
      label(ctx, state.whichPath ? 'Welcher-Weg-Detektor aktiv' : 'beide Spalte offen', barrierX - 34, 40, state.whichPath ? PALETTE.accent : PALETTE.muted, 11);
    }

    let raf = null;
    function frame(now) {
      if (!state.last) state.last = now;
      const dt = Math.min((now - state.last) / 1000, 0.05);
      state.last = now;

      state.packets.forEach((packet) => { packet.t += dt * 1.7; });
      state.packets = state.packets.filter((packet) => {
        if (packet.t >= 1) {
          addHit(packet.target);
          return false;
        }
        return true;
      });

      if (state.auto) {
        state.emitAcc += dt;
        if (state.emitAcc >= 0.32) {
          state.emitAcc = 0;
          emit(1);
        }
      }

      draw();
      raf = requestAnimationFrame(frame);
    }

    const waveCheck = document.createElement('label');
    waveCheck.className = 'tool-check';
    const waveInput = document.createElement('input');
    waveInput.type = 'checkbox';
    waveInput.checked = state.showWave;
    waveInput.addEventListener('change', () => {
      state.showWave = waveInput.checked;
      draw();
    });
    waveCheck.append(waveInput, make('span', '', '|ψ|² anzeigen'));

    const pathCheck = document.createElement('label');
    pathCheck.className = 'tool-check';
    const pathInput = document.createElement('input');
    pathInput.type = 'checkbox';
    pathInput.checked = state.whichPath;
    pathInput.addEventListener('change', () => {
      state.whichPath = pathInput.checked;
      rebuildDistribution();
      clear();
    });
    pathCheck.append(pathInput, make('span', '', 'Welcher-Weg-Detektor'));

    const actions = make('div', 'tool-actions');
    const autoButton = actionButton('Auto', () => {
      state.auto = !state.auto;
      autoButton.setAttribute('aria-pressed', String(state.auto));
      autoButton.textContent = state.auto ? 'Auto aus' : 'Auto';
      if (state.auto && REDUCED) {
        emit(10);
        state.auto = false;
        autoButton.setAttribute('aria-pressed', 'false');
        autoButton.textContent = 'Auto';
      }
    });
    autoButton.setAttribute('aria-pressed', 'false');
    actions.append(
      actionButton('1 Teilchen', () => emit(1)),
      actionButton('10 Teilchen', () => emit(10)),
      autoButton,
      actionButton('Löschen', clear)
    );
    controls.append(waveCheck, pathCheck, actions);

    rebuildDistribution();
    updateReadout();
    updateStatus();
    draw();

    if (!REDUCED) raf = requestAnimationFrame(frame);
    if (typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !REDUCED && !raf) {
            state.last = 0;
            raf = requestAnimationFrame(frame);
          } else if (!entry.isIntersecting && raf) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        });
      }, { threshold: 0.05 });
      observer.observe(root);
    }
  }

  /* ---------------------------------------------------------------
     Unbestimmtheit und Orbital
  --------------------------------------------------------------- */
  function initUncertainty(root) {
    const controls = $('[data-tool-controls]', root);
    const stage = $('[data-tool-stage]', root);
    const readout = $('[data-tool-readout]', root);
    const status = $('[data-tool-status]', root);
    const fallback = $('.tool__fallback', stage);
    if (fallback) fallback.remove();
    if (!controls || !stage || !readout) return;

    const { ctx, w: W, h: Hc } = canvasIn(stage);
    const state = {
      tab: 'rechner',
      dxLog: 83.333,
      orbital: '1s'
    };

    const dxFromSlider = (value) => 10 ** (-15 + (value / 100) * 6);

    function currentDx() {
      return dxFromSlider(state.dxLog);
    }

    function currentDp() {
      return H / (4 * Math.PI * currentDx());
    }

    function currentDv() {
      return currentDp() / ME;
    }

    function updateReadout() {
      if (state.tab === 'rechner') {
        readout.replaceChildren(
          readoutItem('Δx', unitLength(currentDx())),
          readoutItem('Δp min', `${sci(currentDp())} kg·m/s`),
          readoutItem('Δv min', `${sci(currentDv())} m/s`)
        );
      } else {
        const info = state.orbital === '1s'
          ? ['1s', '0', 'Dichte am Kern maximal']
          : state.orbital === '2s'
            ? ['2s', '1', 'Knoten bei r = 2a₀']
            : ['2p', '1', 'Knotenebene, zwei Keulen'];
        readout.replaceChildren(
          readoutItem('Orbital', info[0]),
          readoutItem('Knoten', info[1]),
          readoutItem('Form', info[2])
        );
      }
    }

    function updateStatus() {
      if (!status) return;
      if (state.tab === 'rechner') {
        const dv = currentDv();
        if (state.dxLog <= 8) {
          status.textContent = `Sehr starke Lokalisierung: Δv ≈ ${sci(dv)} m/s. Ein Elektron wäre so nicht dauerhaft im Kern gebunden.`;
        } else if (state.dxLog >= 94) {
          status.textContent = `Sehr unscharfer Ort: Δx ≈ ${unitLength(currentDx())}. Der Impuls ist dafür relativ gut definiert.`;
        } else {
          status.textContent = `Bei Δx = ${unitLength(currentDx())} ist Δv ≈ ${sci(dv)} m/s – in der Größenordnung der Elektronengeschwindigkeit im Atom.`;
        }
      } else if (state.orbital === '2s') {
        status.textContent = 'Beim 2s-Orbital gibt es eine Kugelfläche, auf der die Wellenfunktion null ist: den radialen Knoten.';
      } else if (state.orbital === '2p') {
        status.textContent = 'Beim 2p-Orbital liegt die Knotenebene zwischen zwei Keulen. Die Aufenthaltswahrscheinlichkeit ist am Kern null.';
      } else {
        status.textContent = 'Das 1s-Orbital hat keine Knoten. Die Aufenthaltswahrscheinlichkeit ist am Kern am größten.';
      }
    }

    function renderControls() {
      controls.replaceChildren();
      if (state.tab === 'rechner') {
        const slider = sliderRow({
          label: 'Ortunbestimmtheit Δx',
          min: 0,
          max: 100,
          step: 0.1,
          value: state.dxLog,
          format: (v) => unitLength(dxFromSlider(v)),
          onInput: (v) => {
            state.dxLog = v;
            updateReadout();
            updateStatus();
            draw();
          }
        });
        controls.append(slider.row);
        const actions = make('div', 'tool-actions');
        actions.append(
          actionButton('Elektron im Atom (100 pm)', () => {
            slider.set(83.333, false);
            state.dxLog = 83.333;
            updateReadout();
            updateStatus();
            draw();
          }),
          actionButton('Elektron im Kern (1 fm)', () => {
            slider.set(0, false);
            state.dxLog = 0;
            updateReadout();
            updateStatus();
            draw();
          }),
          actionButton('1 nm', () => {
            slider.set(100, false);
            state.dxLog = 100;
            updateReadout();
            updateStatus();
            draw();
          })
        );
        controls.append(actions);
      } else {
        const orbitalSeg = segControl([
          { value: '1s', label: '1s' },
          { value: '2s', label: '2s' },
          { value: '2p', label: '2p' }
        ], state.orbital, (value) => {
          state.orbital = value;
          updateReadout();
          updateStatus();
          draw();
        }, 'Orbital wählen');
        controls.append(orbitalSeg);
        const note = make('p', 'tool-status', 'Schematischer Schnitt durch |ψ|². Die Formen sind didaktisch vereinfacht.');
        controls.append(note);
      }
    }

    function logPos(value, min, max, length) {
      return ((Math.log10(value) - min) / (max - min)) * length;
    }

    function drawUncertaintyGraph() {
      ctx.clearRect(0, 0, W, Hc);
      ctx.fillStyle = PALETTE.paper;
      ctx.fillRect(0, 0, W, Hc);

      const left = 70;
      const right = W - 28;
      const top = 34;
      const bottom = Hc - 48;
      const plotW = right - left;
      const plotH = bottom - top;

      const xMin = -15;
      const xMax = -9;
      const yMin = 1;
      const yMax = 9;

      const xPix = (logx) => left + ((logx - xMin) / (xMax - xMin)) * plotW;
      const yPix = (logy) => bottom - ((logy - yMin) / (yMax - yMin)) * plotH;

      // grid
      ctx.strokeStyle = 'rgba(184, 177, 162, 0.65)';
      ctx.lineWidth = 1;
      for (let logx = xMin; logx <= xMax; logx += 1) {
        const x = xPix(logx);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
      }
      for (let logy = yMin; logy <= yMax; logy += 2) {
        const y = yPix(logy);
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
      }

      // atom region
      const atomLeft = xPix(Math.log10(3e-11));
      const atomRight = xPix(Math.log10(3e-10));
      ctx.fillStyle = 'rgba(166, 61, 47, 0.08)';
      ctx.fillRect(atomLeft, top, atomRight - atomLeft, plotH);
      label(ctx, 'typische Atomgröße', atomLeft + 6, top + 14, PALETTE.accent, 11);

      // curve
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 240; i += 1) {
        const logx = xMin + (i / 240) * (xMax - xMin);
        const dx = 10 ** logx;
        const dv = H / (4 * Math.PI * dx * ME);
        const x = xPix(logx);
        const y = yPix(Math.log10(dv));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // current point
      const dx = currentDx();
      const dv = currentDv();
      const px = xPix(Math.log10(dx));
      const py = yPix(Math.log10(dv));
      ctx.fillStyle = PALETTE.accent;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = PALETTE.paper;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, TAU);
      ctx.stroke();

      label(ctx, `Δv ≈ ${sci(dv)} m/s`, px + 12, py - 14, PALETTE.accent, 12);
      label(ctx, 'Δx', right - 6, bottom + 22, PALETTE.ink, 12, 'right');
      label(ctx, 'Δv_min (m/s)', left + 2, top - 12, PALETTE.ink, 12);
      label(ctx, '1 fm', xPix(-15), bottom + 22, PALETTE.muted, 10, 'center');
      label(ctx, '1 pm', xPix(-12), bottom + 22, PALETTE.muted, 10, 'center');
      label(ctx, '1 nm', xPix(-9), bottom + 22, PALETTE.muted, 10, 'center');
      label(ctx, '10⁵', left - 10, yPix(5), PALETTE.muted, 10, 'right');
      label(ctx, '10⁷', left - 10, yPix(7), PALETTE.muted, 10, 'right');
      label(ctx, '10⁹', left - 10, yPix(9), PALETTE.muted, 10, 'right');
    }

    function orbitalDensity(x, y) {
      const r = Math.hypot(x, y);
      if (state.orbital === '1s') return Math.exp(-2 * r);
      if (state.orbital === '2s') return ((2 - r) ** 2) * Math.exp(-r);
      return (y * y) * Math.exp(-r);
    }

    function drawOrbital() {
      ctx.clearRect(0, 0, W, Hc);
      ctx.fillStyle = PALETTE.paper;
      ctx.fillRect(0, 0, W, Hc);

      const size = Math.min(Hc - 40, 320);
      const cx = 56 + size / 2;
      const cy = Hc / 2;
      const half = size / 2;
      const cells = 160;
      const off = document.createElement('canvas');
      off.width = cells;
      off.height = cells;
      const octx = off.getContext('2d');
      const image = octx.createImageData(cells, cells);

      let max = 0;
      const values = new Float64Array(cells * cells);
      for (let j = 0; j < cells; j += 1) {
        for (let i = 0; i < cells; i += 1) {
          const x = ((i + 0.5) / cells - 0.5) * 8;
          const y = ((j + 0.5) / cells - 0.5) * 8;
          const value = orbitalDensity(x, y);
          values[j * cells + i] = value;
          if (value > max) max = value;
        }
      }
      max = max || 1;

      const paper = [243, 240, 231];
      const accent = [166, 61, 47];
      for (let k = 0; k < values.length; k += 1) {
        const t = Math.pow(values[k] / max, 0.52);
        const idx = k * 4;
        image.data[idx] = Math.round(paper[0] + (accent[0] - paper[0]) * t);
        image.data[idx + 1] = Math.round(paper[1] + (accent[1] - paper[1]) * t);
        image.data[idx + 2] = Math.round(paper[2] + (accent[2] - paper[2]) * t);
        image.data[idx + 3] = 255;
      }
      octx.putImageData(image, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, cx - half, cy - half, size, size);
      ctx.restore();

      ctx.strokeStyle = PALETTE.rule;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - half, cy - half, size, size);

      // axes
      dashedLine(ctx, cx - half, cy, cx + half, cy, 'rgba(33, 31, 28, 0.35)', [4, 4]);
      dashedLine(ctx, cx, cy - half, cx, cy + half, 'rgba(33, 31, 28, 0.35)', [4, 4]);

      // nucleus
      ctx.fillStyle = PALETTE.ink;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, TAU);
      ctx.fill();

      if (state.orbital === '2s') {
        const rPix = (2 / 4) * half;
        ctx.strokeStyle = PALETTE.blue;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, rPix, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        label(ctx, 'Knoten', cx + rPix + 8, cy - 8, PALETTE.blue, 11);
      }
      if (state.orbital === '2p') {
        label(ctx, 'Knotenebene', cx + 12, cy + 14, PALETTE.blue, 11);
      }

      // right-side explanation
      const tx = cx + half + 36;
      const title = state.orbital === '1s' ? '1s-Orbital' : state.orbital === '2s' ? '2s-Orbital' : '2p-Orbital';
      label(ctx, title, tx, cy - 44, PALETTE.ink, 18);
      const text = state.orbital === '1s'
        ? ['Kugelförmig, keine Knoten.', 'Die Dichte ist am Kern maximal.']
        : state.orbital === '2s'
          ? ['Kugelförmig, ein radialer Knoten.', 'Bei r = 2a₀ ist |ψ|² = 0.']
          : ['Zwei Keulen, eine Knotenebene.', 'Am Kern ist die Dichte null.'];
      text.forEach((line, index) => {
        label(ctx, line, tx, cy - 14 + index * 22, PALETTE.ink2, 13);
      });
      label(ctx, 'schematischer Schnitt', tx, cy + 54, PALETTE.muted, 11);
    }

    function draw() {
      if (state.tab === 'rechner') drawUncertaintyGraph();
      else drawOrbital();
    }

    const tabs = $$('[data-tab]', root);
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        state.tab = tab.dataset.tab;
        tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
        renderControls();
        updateReadout();
        updateStatus();
        draw();
      });
    });

    renderControls();
    updateReadout();
    updateStatus();
    draw();
  }

  /* ---------------------------------------------------------------
     PhET-Einbettung
  --------------------------------------------------------------- */
  function initPhet(root) {
    const stage = $('[data-phet-stage]', root);
    const button = $('[data-phet-load]', root);
    if (!stage || !button) return;
    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://phet.colorado.edu/sims/html/quantum-wave-interference/latest/quantum-wave-interference_all.html?locale=de';
      iframe.title = 'PhET-Simulation: Interferenz von Quantenwellen';
      iframe.loading = 'lazy';
      iframe.allow = 'fullscreen';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      stage.replaceChildren(iframe);
    });
  }

  /* ---------------------------------------------------------------
     Init
  --------------------------------------------------------------- */
  document.documentElement.classList.add('js');
  $$('[data-tool="doppelspalt"]').forEach(initDoubleSlit);
  $$('[data-tool="einzelteilchen"]').forEach(initSingleParticle);
  $$('[data-tool="unbestimmtheit"]').forEach(initUncertainty);
  $$('[data-phet]').forEach(initPhet);
})();
