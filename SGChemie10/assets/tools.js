(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const NS = 'http://www.w3.org/2000/svg';
  const registry = {};
  let helpers = {};

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmt(value, digits = 1) {
    return helpers.formatDe ? helpers.formatDe(value, digits) : String(value);
  }

  function superscript(value) {
    const map = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
    return String(value).split('').map((char) => map[char] || char).join('');
  }

  function sci(value) {
    if (!Number.isFinite(value) || value <= 0) return '0';
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / Math.pow(10, exponent);
    return `${fmt(mantissa, 1)} × 10${superscript(exponent)}`;
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function stage(root) { return $('[data-tool-stage]', root); }
  function controls(root) { return $('[data-tool-controls]', root); }
  function readout(root) { return $('[data-tool-readout]', root); }

  function setStage(root, html) {
    const el = stage(root);
    if (!el) return;
    el.innerHTML = html;
  }

  function setReadout(root, items) {
    const el = readout(root);
    if (!el) return;
    el.replaceChildren();
    items.forEach((item) => {
      const span = make('span');
      span.append(document.createTextNode(`${item.label} `));
      const b = make('b', '', item.value);
      span.append(b);
      el.append(span);
    });
  }

  function note(root, text) {
    let el = root.querySelector('[data-tool-note]');
    if (!el) {
      el = make('p', 'tool__note');
      el.dataset.toolNote = 'true';
      const readoutEl = readout(root);
      if (readoutEl) readoutEl.after(el);
      else root.append(el);
    }
    el.textContent = text || '';
    el.hidden = !text;
  }

  function segment(root, items, current, onChange, label) {
    const wrap = make('div', 'seg');
    wrap.setAttribute('role', 'group');
    if (label) wrap.setAttribute('aria-label', label);
    items.forEach((item) => {
      const button = make('button', '', item.label);
      button.type = 'button';
      button.dataset.value = item.value;
      button.setAttribute('aria-pressed', String(item.value === current));
      button.addEventListener('click', () => {
        $$('button', wrap).forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate.dataset.value === item.value)));
        onChange(item.value);
      });
      wrap.append(button);
    });
    controls(root).append(wrap);
    return wrap;
  }

  function selectField(root, labelText, options, current, onChange) {
    const field = make('label', 'field');
    const label = make('span', '', labelText);
    const select = document.createElement('select');
    options.forEach((option) => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      if (option.value === current) opt.selected = true;
      select.append(opt);
    });
    select.addEventListener('change', () => onChange(select.value));
    field.append(label, select);
    controls(root).append(field);
    return select;
  }

  function svg(viewBox, label, inner, className = 'diagram') {
    return `<svg class="${className}" viewBox="${viewBox}" role="img" aria-label="${esc(label)}">${inner}</svg>`;
  }

  function text(x, y, content, className = 'label-strong', anchor = 'middle') {
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${className}">${esc(content)}</text>`;
  }

  /* ---------------------------------------------------------------
     1. MO-Schema
  --------------------------------------------------------------- */
  function moTool(root, data) {
    let current = data.systems[0].id;
    segment(root, data.systems.map((s) => ({ value: s.id, label: s.label })), current, (value) => {
      current = value;
      update();
    }, 'System wählen');

    function arrows(x, y, count) {
      if (count === 0) return '';
      const one = `<text x="${x}" y="${y}" text-anchor="middle" class="ink-text" font-size="18">↑</text>`;
      const two = `${one}<text x="${x + 9}" y="${y}" text-anchor="middle" class="ink-text" font-size="18">↓</text>`;
      return count === 1 ? one : two;
    }

    function update() {
      const system = data.systems.find((s) => s.id === current) || data.systems[0];
      const inner = `
        <line x1="50" y1="22" x2="50" y2="312" class="rule-strong"/>
        ${text(58, 32, 'Energie', 'label-muted', 'start')}
        <line x1="110" y1="170" x2="200" y2="170" class="rule-strong"/>
        <line x1="520" y1="170" x2="610" y2="170" class="rule-strong"/>
        ${text(155, 150, system.aoLabel || 'A', 'label-strong')}
        ${text(565, 150, system.aoLabel || 'B', 'label-strong')}
        ${text(155, 196, '1s', 'label-strong')}
        ${text(565, 196, '1s', 'label-strong')}
        ${text(155, 320, 'Atomorbital', 'label-muted')}
        ${text(565, 320, 'Atomorbital', 'label-muted')}
        <line x1="200" y1="170" x2="300" y2="110" class="rule" stroke-dasharray="3 4"/>
        <line x1="200" y1="170" x2="300" y2="230" class="rule" stroke-dasharray="3 4"/>
        <line x1="520" y1="170" x2="420" y2="110" class="rule" stroke-dasharray="3 4"/>
        <line x1="520" y1="170" x2="420" y2="230" class="rule" stroke-dasharray="3 4"/>
        <line x1="300" y1="110" x2="420" y2="110" class="rule-strong"/>
        <line x1="300" y1="230" x2="420" y2="230" class="rule-strong"/>
        ${text(360, 30, 'Molekülorbitale', 'label-muted')}
        ${text(430, 114, 'σ*', 'label-strong', 'start')}
        ${text(430, 234, 'σ', 'label-strong', 'start')}
        ${arrows(155, 170, system.aoLeft)}
        ${arrows(565, 170, system.aoRight)}
        ${arrows(360, 230, system.bonding)}
        ${arrows(360, 110, system.antibonding)}
      `;
      setStage(root, svg('0 0 720 340', `${system.label}: Molekülorbitalschema`, inner));
      setReadout(root, [
        { label: 'Bindungsordnung', value: String(system.bondOrder).replace('.', ',') },
        { label: 'bindend', value: String(system.bonding) },
        { label: 'antibindend', value: String(system.antibonding) },
      ]);
      note(root, `Die 1s-Atomorbitale liegen auf gleicher Höhe zwischen σ und σ*. ${system.note}`);
    }

    update();
  }

  /* ---------------------------------------------------------------
     2. Valenzstrich-Werkstatt
  --------------------------------------------------------------- */
  function valenceTool(root, data) {
    let current = data.molecules[0].id;
    let resonance = 0;
    segment(root, data.molecules.map((m) => ({ value: m.id, label: m.label })), current, (value) => {
      current = value;
      resonance = 0;
      update();
    }, 'Molekül wählen');

    function bondLines(center, terminal, order) {
      const dx = terminal.x - center.x;
      const dy = terminal.y - center.y;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;
      const offsets = order === 1 ? [0] : order === 2 ? [-4, 4] : [-6, 0, 6];
      return offsets.map((offset) => `<line x1="${center.x + px * offset}" y1="${center.y + py * offset}" x2="${terminal.x + px * offset}" y2="${terminal.y + py * offset}" class="rule-strong"/>`).join('');
    }

    function lonePairStroke(cx, cy, angle, distance) {
      const ux = Math.cos(angle);
      const uy = -Math.sin(angle);
      const px = cx + ux * distance;
      const py = cy + uy * distance;
      const tx = -uy;
      const ty = ux;
      const half = 6;
      return `<line x1="${px - tx * half}" y1="${py - ty * half}" x2="${px + tx * half}" y2="${py + ty * half}" class="rule-strong" stroke-width="1.5"/>`;
    }

    function terminalLoneAngles(center, terminal, count) {
      const outward = Math.atan2(-(terminal.y - center.y), terminal.x - center.x);
      if (count <= 0) return [];
      if (count === 1) return [outward];
      if (count === 2) return [outward - (25 * Math.PI) / 180, outward + (25 * Math.PI) / 180];
      return [outward - (30 * Math.PI) / 180, outward, outward + (30 * Math.PI) / 180];
    }

    function centerLoneAngles(center, terminals, count) {
      if (!count) return [];
      let sx = 0;
      let sy = 0;
      terminals.forEach((terminal) => {
        const dx = terminal.x - center.x;
        const dy = -(terminal.y - center.y);
        const len = Math.hypot(dx, dy) || 1;
        sx += dx / len;
        sy += dy / len;
      });
      const base = (sx === 0 && sy === 0) ? -Math.PI / 2 : Math.atan2(-sy, -sx);
      if (count === 1) return [base];
      if (count === 2) return [base - (45 * Math.PI) / 180, base + (45 * Math.PI) / 180];
      return [base - Math.PI / 2, base, base + Math.PI / 2];
    }

    function atom(cx, cy, label, isCenter) {
      return `<circle cx="${cx}" cy="${cy}" r="${isCenter ? 23 : 19}" class="${isCenter ? 'ink-fill' : 'paper-fill ink-stroke'}" stroke-width="1.4"/>${text(cx, cy + 5, label, isCenter ? 'paper-text' : 'ink-text', 'middle')}`;
    }

    function update() {
      const base = data.molecules.find((m) => m.id === current) || data.molecules[0];
      const molecule = resonance && base.alt ? { ...base, ...base.alt } : base;
      const center = { x: 320, y: 190 };
      let inner = '';
      molecule.terminals.forEach((terminal, index) => {
        inner += bondLines(center, terminal, molecule.bonds[index] || 1);
      });
      inner += atom(center.x, center.y, molecule.center, true);
      molecule.terminals.forEach((terminal) => {
        inner += atom(terminal.x, terminal.y, terminal.el, false);
        terminalLoneAngles(center, terminal, terminal.lp || 0).forEach((angle) => {
          inner += lonePairStroke(terminal.x, terminal.y, angle, 32);
        });
      });
      centerLoneAngles(center, molecule.terminals, molecule.centerLp || 0).forEach((angle) => {
        inner += lonePairStroke(center.x, center.y, angle, 36);
      });
      (molecule.charges || []).forEach((charge) => {
        inner += text(charge.x, charge.y, charge.text, 'accent-text');
      });
      if (base.alt) {
        const wrap = controls(root);
        let seg = wrap.querySelector('[data-resonance]');
        if (!seg) {
          seg = make('div', 'seg');
          seg.dataset.resonance = 'true';
          seg.setAttribute('role', 'group');
          seg.setAttribute('aria-label', 'Mesomere Struktur');
          ['Struktur 1', 'Struktur 2'].forEach((label, index) => {
            const button = make('button', '', label);
            button.type = 'button';
            button.dataset.value = String(index);
            button.setAttribute('aria-pressed', String(index === resonance));
            button.addEventListener('click', () => {
              resonance = index;
              $$('button', seg).forEach((candidate) => candidate.setAttribute('aria-pressed', String(Number(candidate.dataset.value) === resonance)));
              update();
            });
            seg.append(button);
          });
          wrap.append(seg);
        }
        $$('button', seg).forEach((candidate) => candidate.setAttribute('aria-pressed', String(Number(candidate.dataset.value) === resonance)));
      }
      const lonePairs = (molecule.centerLp || 0) + molecule.terminals.reduce((sum, terminal) => sum + (terminal.lp || 0), 0);
      const bondingPairs = molecule.bonds.reduce((sum, bond) => sum + bond, 0);
      setStage(root, svg('0 0 640 360', `${base.label}: Valenzstrichformel`, inner));
      setReadout(root, [
        { label: 'Valenzelektronen', value: String(molecule.valence) },
        { label: 'Bindungspaare', value: String(bondingPairs) },
        { label: 'freie Paare', value: String(lonePairs) },
      ]);
      note(root, molecule.note || base.note);
    }

    update();
  }

  /* ---------------------------------------------------------------
     3. EPA-Molekülbetrachter
  --------------------------------------------------------------- */
  function epaTool(root, data) {
    let current = data.molecules[0].id;
    let rotY = -0.55;
    let rotX = -0.18;
    let showPairs = true;
    segment(root, data.molecules.map((m) => ({ value: m.id, label: m.label })), current, (value) => {
      current = value;
      update();
    }, 'Molekül wählen');

    const rotateControl = document.createElement('label');
    rotateControl.className = 'slider-row';
    rotateControl.innerHTML = '<span>Ansicht drehen</span><input type="range" min="0" max="360" value="328" step="1" aria-label="Ansicht drehen"><output>328°</output>';
    controls(root).append(rotateControl);
    const range = rotateControl.querySelector('input');
    const output = rotateControl.querySelector('output');
    range.addEventListener('input', () => {
      rotY = (Number(range.value) * Math.PI) / 180;
      output.textContent = `${range.value}°`;
      update();
    });

    const pairToggle = make('div', 'seg');
    pairToggle.setAttribute('role', 'group');
    pairToggle.setAttribute('aria-label', 'Elektronenpaare');
    [['Paare zeigen', true], ['nur Atome', false]].forEach(([label, value]) => {
      const button = make('button', '', label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(value === showPairs));
      button.addEventListener('click', () => {
        showPairs = value;
        $$('button', pairToggle).forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate.textContent === label)));
        update();
      });
      pairToggle.append(button);
    });
    controls(root).append(pairToggle);

    function geometry(molecule) {
      const tetra = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
      if (molecule.shape === 'tetra') return { ligands: tetra, lone: [] };
      if (molecule.shape === 'pyramidal') return { ligands: tetra.slice(0, 3), lone: [tetra[3]] };
      if (molecule.shape === 'bent') return { ligands: tetra.slice(0, 2), lone: tetra.slice(2) };
      if (molecule.shape === 'trigonal') return { ligands: [[1, 0, 0], [-0.5, 0.866, 0], [-0.5, -0.866, 0]], lone: [] };
      if (molecule.shape === 'linear') return { ligands: [[1, 0, 0], [-1, 0, 0]], lone: [] };
      return { ligands: [[1, 0, 0]], lone: [] };
    }

    function norm(p) {
      const len = Math.hypot(p[0], p[1], p[2]) || 1;
      return [p[0] / len, p[1] / len, p[2] / len];
    }

    function rotatePoint(p) {
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const x1 = p[0] * cy + p[2] * sy;
      const z1 = -p[0] * sy + p[2] * cy;
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);
      const y1 = p[1] * cx - z1 * sx;
      const z2 = p[1] * sx + z1 * cx;
      return [x1, y1, z2];
    }

    function project(p) {
      const r = rotatePoint(p);
      const scale = 108;
      return { x: 260 + r[0] * scale, y: 178 - r[1] * scale, z: r[2] };
    }

    function update() {
      const molecule = data.molecules.find((m) => m.id === current) || data.molecules[0];
      const geom = geometry(molecule);
      const ligandPoints = geom.ligands.map(norm);
      const center = { x: 260, y: 178, z: 0 };
      const projected = ligandPoints.map((point, index) => ({
        ...project(point),
        el: molecule.ligands[index].el,
        order: molecule.ligands[index].order || 1,
      }));
      let inner = '';
      if (showPairs) {
        geom.lone.map(norm).forEach((direction) => {
          const p = project(direction);
          inner += `<line x1="${center.x}" y1="${center.y}" x2="${p.x}" y2="${p.y}" class="accent" stroke-dasharray="4 4" stroke-width="1.3"/>`;
          inner += `<circle cx="${p.x - 5}" cy="${p.y}" r="3" class="accent-fill"/><circle cx="${p.x + 5}" cy="${p.y}" r="3" class="accent-fill"/>`;
        });
      }
      projected.forEach((ligand) => {
        const offsets = ligand.order === 1 ? [0] : ligand.order === 2 ? [-4, 4] : [-6, 0, 6];
        const dx = ligand.x - center.x;
        const dy = ligand.y - center.y;
        const len = Math.hypot(dx, dy) || 1;
        const px = -dy / len;
        const py = dx / len;
        offsets.forEach((offset) => {
          inner += `<line x1="${center.x + px * offset}" y1="${center.y + py * offset}" x2="${ligand.x + px * offset}" y2="${ligand.y + py * offset}" class="ink-stroke" stroke-width="2"/>`;
        });
      });
      const atoms = [{ ...center, el: molecule.center, isCenter: true }, ...projected];
      atoms.sort((a, b) => a.z - b.z);
      atoms.forEach((atom) => {
        const radius = atom.isCenter ? 23 : 17;
        inner += `<circle cx="${atom.x}" cy="${atom.y}" r="${radius}" class="${atom.isCenter ? 'ink-fill' : 'paper-fill ink-stroke'}" stroke-width="1.5"/>`;
        inner += text(atom.x, atom.y + 5, atom.el, atom.isCenter ? 'paper-text' : 'ink-text');
      });
      const label = `${molecule.label}: ${molecule.geometry}, Bindungswinkel ${molecule.angle}`;
      setStage(root, svg('0 0 520 356', label, inner));
      setReadout(root, [
        { label: 'Geometrie', value: molecule.geometry },
        { label: 'Bindungswinkel', value: molecule.angle },
        { label: 'Paare am Zentralatom', value: molecule.pairs },
      ]);
      note(root, molecule.note);
    }

    const stageEl = stage(root);
    stageEl.dataset.drag = 'true';
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    stageEl.addEventListener('pointerdown', (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      stageEl.setPointerCapture(event.pointerId);
      stageEl.style.cursor = 'grabbing';
    });
    stageEl.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      rotY += (event.clientX - lastX) * 0.01;
      rotX += (event.clientY - lastY) * 0.01;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      lastX = event.clientX;
      lastY = event.clientY;
      range.value = String(Math.round(((rotY * 180) / Math.PI + 360) % 360));
      output.textContent = `${range.value}°`;
      update();
    });
    stageEl.addEventListener('pointerup', (event) => {
      dragging = false;
      stageEl.style.cursor = 'grab';
      if (stageEl.hasPointerCapture(event.pointerId)) stageEl.releasePointerCapture(event.pointerId);
    });
    stageEl.addEventListener('pointercancel', () => { dragging = false; stageEl.style.cursor = 'grab'; });

    update();
  }

  /* ---------------------------------------------------------------
     4. Polaritäts-Check
  --------------------------------------------------------------- */
  function polarityTool(root, data) {
    let current = data.molecules[0].id;
    selectField(root, 'Molekül', data.molecules.map((m) => ({ value: m.id, label: m.label })), current, (value) => {
      current = value;
      update();
    });

    function atom(x, y, label, en) {
      return `<circle cx="${x}" cy="${y}" r="26" class="paper-fill ink-stroke" stroke-width="1.4"/><text x="${x}" y="${y + 6}" text-anchor="middle" class="ink-text" font-size="16">${esc(label)}</text><text x="${x}" y="${y + 43}" text-anchor="middle" class="label-muted" font-size="12">${fmt(en, 2)}</text>`;
    }

    function update() {
      const molecule = data.molecules.find((m) => m.id === current) || data.molecules[0];
      let inner = `<defs><marker id="dipoleArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-accent)"/></marker><marker id="netArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-ink)"/></marker></defs>`;
      molecule.bonds.forEach(([a, b]) => {
        const left = molecule.atoms[a];
        const right = molecule.atoms[b];
        inner += `<line x1="${left.x}" y1="${left.y}" x2="${right.x}" y2="${right.y}" class="rule-strong"/>`;
      });
      molecule.atoms.forEach((atomData) => {
        inner += atom(atomData.x, atomData.y, atomData.el, atomData.en);
      });
      molecule.bonds.forEach(([a, b]) => {
        const left = molecule.atoms[a];
        const right = molecule.atoms[b];
        const from = left.en <= right.en ? left : right;
        const to = left.en <= right.en ? right : left;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const sx = from.x + ux * 30;
        const sy = from.y + uy * 30;
        const ex = to.x - ux * 30;
        const ey = to.y - uy * 30;
        const midX = (sx + ex) / 2;
        const midY = (sy + ey) / 2;
        inner += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="var(--color-accent)" stroke-width="2" marker-end="url(#dipoleArrow)"/>`;
        inner += `<text x="${midX - uy * 22}" y="${midY + ux * 22}" text-anchor="middle" class="accent-text" font-size="13">δ${left.en <= right.en ? '+' : '-'}</text>`;
        inner += `<text x="${midX + uy * 22}" y="${midY - ux * 22}" text-anchor="middle" class="accent-text" font-size="13">δ${left.en <= right.en ? '-' : '+'}</text>`;
      });
      if (molecule.net) {
        const [nx, ny] = molecule.net;
        const len = Math.hypot(nx, ny) || 1;
        const ux = nx / len;
        const uy = ny / len;
        const cx = 320;
        const cy = 306;
        const ex = cx + ux * 96;
        const ey = cy + uy * 34;
        inner += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" class="ink-stroke" stroke-width="3" marker-end="url(#netArrow)"/>`;
        inner += `<text x="320" y="292" text-anchor="middle" class="ink-text" font-size="13">Gesamtdipol</text>`;
        inner += `<text x="${ex}" y="${Math.min(ey + 22, 354)}" text-anchor="middle" class="label-muted" font-size="12">${molecule.polar ? 'polar' : 'unpolar'}</text>`;
      } else {
        inner += text(20, 28, 'Bindungsdipole heben sich auf: kein Gesamtdipol', 'label-strong', 'start');
      }
      const maxDelta = Math.max(...molecule.bonds.map(([a, b]) => Math.abs(molecule.atoms[a].en - molecule.atoms[b].en)));
      setStage(root, svg('0 0 640 360', `${molecule.label}: Bindungs- und Molekülpolarität`, inner));
      setReadout(root, [
        { label: 'größte ΔEN', value: fmt(maxDelta, 2) },
        { label: 'Bindungspolarität', value: maxDelta < 0.4 ? 'unpolar' : maxDelta < 1.5 ? 'polar' : 'ionisch' },
        { label: 'Molekülpolarität', value: molecule.polar ? 'polar' : 'unpolar' },
      ]);
      note(root, molecule.note);
    }

    update();
  }

  /* ---------------------------------------------------------------
     5. Wechselwirkungs-Rangliste
  --------------------------------------------------------------- */
  function imfTool(root, data) {
    let current = data.molecules[0].id;
    selectField(root, 'Molekül', data.molecules.map((m) => ({ value: m.id, label: m.label })), current, (value) => {
      current = value;
      update();
    });

    function update() {
      const min = data.min;
      const max = data.max;
      const plotLeft = 156;
      const plotRight = 590;
      const top = 34;
      const rowHeight = 34;
      const bottom = top + data.molecules.length * rowHeight;
      const x = (bp) => plotLeft + ((bp - min) / (max - min)) * (plotRight - plotLeft);
      const ticks = [-150, -100, -50, 0, 50, 100];
      let inner = '';
      ticks.forEach((tick) => {
        inner += `<line x1="${x(tick)}" y1="${top - 8}" x2="${x(tick)}" y2="${bottom - 14}" class="gridline"/>`;
        inner += text(x(tick), bottom + 18, `${tick} °C`, 'label-muted', 'middle');
      });
      inner += `<line x1="${plotLeft}" y1="${bottom - 14}" x2="${plotRight}" y2="${bottom - 14}" class="axis"/>`;
      data.molecules.forEach((molecule, index) => {
        const y = top + index * rowHeight;
        const selected = molecule.id === current;
        inner += `<rect x="0" y="${y - 15}" width="720" height="${rowHeight}" fill="transparent" tabindex="0" role="button" aria-label="${esc(molecule.label)}, ${fmt(molecule.bp, 1)} Grad Celsius" data-row="${molecule.id}" style="cursor:pointer"/>`;
        inner += text(142, y + 4, molecule.label, selected ? 'ink-text label-strong' : 'label-muted', 'end');
        inner += `<line x1="${x(molecule.bp)}" y1="${y - 6}" x2="${x(molecule.bp)}" y2="${y + 8}" class="${selected ? 'accent' : 'rule'}" stroke-width="${selected ? 3 : 1}"/>`;
        inner += `<circle cx="${x(molecule.bp)}" cy="${y}" r="${selected ? 6 : 4.2}" class="${selected ? 'accent-fill' : 'ink-fill'}"/>`;
        inner += `<text x="708" y="${y + 4}" text-anchor="end" class="value" font-size="12">${fmt(molecule.bp, 1)}</text>`;
      });
      const molecule = data.molecules.find((m) => m.id === current) || data.molecules[0];
      const interactions = [
        { label: 'London-Dispersions-Wechselwirkung', on: !!molecule.interactions?.london },
        { label: 'Dipol-Dipol-Wechselwirkung', on: !!molecule.interactions?.dipole },
        { label: 'Wasserstoffbrücken', on: !!molecule.interactions?.hbond },
      ];
      const interactionList = `<div class="interaction-list"><p class="interaction-title">Wirkende Wechselwirkungen</p>${interactions.map((item) => `<div class="interaction-row"><span class="interaction-mark ${item.on ? 'is-on' : 'is-off'}" aria-hidden="true">${item.on ? '✓' : '×'}</span><span class="interaction-label">${esc(item.label)}</span><span class="interaction-state">${item.on ? 'wirkt' : 'wirkt nicht'}</span></div>`).join('')}</div>`;
      setStage(root, `<div class="chart-scroll">${svg('0 0 720 420', 'Siedetemperaturen ausgewählter Moleküle', inner, 'diagram chart')}</div>${interactionList}`);
      setReadout(root, [
        { label: 'Molekül', value: molecule.label },
        { label: 'Siedetemperatur', value: `${fmt(molecule.bp, 1)} °C` },
        { label: 'stärkste', value: molecule.type },
      ]);
      note(root, `${molecule.note} Siedetemperaturen bei 1013 hPa, gerundete Literaturwerte.`);
      $$('[data-row]', stage(root)).forEach((row) => {
        const activate = () => {
          current = row.dataset.row;
          update();
        };
        row.addEventListener('click', activate);
        row.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activate();
          }
        });
      });
    }

    update();
  }

  /* ---------------------------------------------------------------
     6. Löslichkeitslabor
  --------------------------------------------------------------- */
  function solubilityTool(root, data) {
    let solvent = data.solvents[0].id;
    let solute = data.solutes[0].id;
    segment(root, data.solvents.map((s) => ({ value: s.id, label: s.label })), solvent, (value) => {
      solvent = value;
      update();
    }, 'Lösemittel');
    segment(root, data.solutes.map((s) => ({ value: s.id, label: s.label })), solute, (value) => {
      solute = value;
      update();
    }, 'Stoff');

    function beaker(result) {
      const onePhase = result.level === 2;
      const limited = result.level === 1;
      let liquid = '';
      if (onePhase) {
        liquid = `<path d="M 212 190 L 212 300 Q 212 326 238 326 L 402 326 Q 428 326 428 300 L 428 190 Z" class="soft-fill"/>`;
        liquid += text(320, 272, 'eine Phase', 'label-strong');
      } else {
        liquid = `<path d="M 212 190 L 212 300 Q 212 326 238 326 L 402 326 Q 428 326 428 300 L 428 190 Z" class="soft-fill"/>`;
        liquid += `<path d="M 212 190 L 212 234 L 428 234 L 428 190 Z" class="ink-fill" opacity="0.18"/>`;
        liquid += `<line x1="212" y1="234" x2="428" y2="234" class="accent" stroke-dasharray="4 4"/>`;
        liquid += text(320, 216, limited ? 'begrenzt mischbar' : 'zwei Phasen', 'label-strong');
      }
      const inner = `
        <path d="M 200 78 L 200 300 Q 200 338 238 338 L 402 338 Q 440 338 440 300 L 440 78" class="rule-strong" fill="none"/>
        <line x1="196" y1="78" x2="444" y2="78" class="rule-strong"/>
        ${liquid}
        ${text(320, 60, data.solvents.find((s) => s.id === solvent).label, 'label-strong')}
        ${text(320, 365, data.solutes.find((s) => s.id === solute).label, 'label-muted')}
      `;
      return svg('0 0 640 390', 'Löslichkeit im Becherglas', inner);
    }

    function update() {
      const result = data.results[solvent][solute];
      setStage(root, beaker(result));
      setReadout(root, [
        { label: 'Löslichkeit', value: result.verdict },
        { label: 'Erklärung', value: result.short },
      ]);
      note(root, result.note);
    }

    update();
  }

  /* ---------------------------------------------------------------
     7. pH-Labor
  --------------------------------------------------------------- */
  function phTool(root, data) {
    let mode = 'acid';
    let step = 2;
    let indicator = 'universal';
    segment(root, [{ value: 'acid', label: 'Säure' }, { value: 'base', label: 'Base' }], mode, (value) => {
      mode = value;
      update();
    }, 'Charakter der Lösung');
    selectField(root, 'Indikator', [
      { value: 'universal', label: 'Universalindikator' },
      { value: 'phenolphthalein', label: 'Phenolphthalein' },
      { value: 'thymolphthalein', label: 'Thymolphthalein' },
    ], indicator, (value) => {
      indicator = value;
      update();
    });

    const slider = document.createElement('label');
    slider.className = 'slider-row';
    slider.innerHTML = '<span>Konzentration</span><input type="range" min="0" max="7" step="1" value="2" aria-label="Konzentration als Zehnerpotenz"><output>10⁻² mol/L</output>';
    controls(root).append(slider);
    const range = slider.querySelector('input');
    const output = slider.querySelector('output');
    range.addEventListener('input', () => {
      step = Number(range.value);
      update();
    });

    function band(pH) {
      if (pH <= 1) return { name: 'rot', className: 'ph-0' };
      if (pH <= 3) return { name: 'orange', className: 'ph-2' };
      if (pH <= 5) return { name: 'gelb', className: 'ph-4' };
      if (pH <= 7) return { name: 'grün', className: 'ph-7' };
      if (pH <= 9) return { name: 'blau', className: 'ph-9' };
      if (pH <= 11) return { name: 'indigo', className: 'ph-11' };
      return { name: 'violett', className: 'ph-13' };
    }

    function indicatorColor(pH) {
      if (indicator === 'phenolphthalein') {
        return pH >= 8.2
          ? { name: 'Phenolphthalein', color: 'pink', className: 'pink-fill', textClass: 'ink-text' }
          : { name: 'Phenolphthalein', color: 'farblos', className: 'soft-fill', textClass: 'ink-text' };
      }
      if (indicator === 'thymolphthalein') {
        return pH >= 9.3
          ? { name: 'Thymolphthalein', color: 'blau', className: 'ph-9', textClass: 'ink-text' }
          : { name: 'Thymolphthalein', color: 'farblos', className: 'soft-fill', textClass: 'ink-text' };
      }
      const universal = band(pH);
      return { name: 'Universalindikator', color: universal.name, className: universal.className, textClass: pH > 9 ? 'paper-text' : 'ink-text' };
    }

    function update() {
      const pH = mode === 'acid' ? step : 14 - step;
      const cH = Math.pow(10, -pH);
      const cOH = Math.pow(10, -(14 - pH));
      const color = indicatorColor(pH);
      output.textContent = `10⁻${step} mol/L`;
      const beaker = `
        <path d="M 222 58 L 222 286 Q 222 322 258 322 L 382 322 Q 418 322 418 286 L 418 58" class="rule-strong" fill="none"/>
        <line x1="218" y1="58" x2="422" y2="58" class="rule-strong"/>
        <path d="M 228 210 L 228 286 Q 228 312 258 312 L 382 312 Q 412 312 412 286 L 412 210 Z" class="ph-fill ${color.className}"/>
        ${text(320, 272, `pH ${pH}`, color.textClass)}
      `;
      let swatches = '';
      for (let i = 0; i <= 14; i += 1) swatches += `<span class="ph-swatch ph-${i}"></span>`;
      const scale = `<div class="ph-scale" aria-hidden="true">${swatches}</div><div class="ph-scale-labels"><span>0</span><span>7</span><span>14</span></div><p class="ph-scale-note">Farbskala: Universalindikator</p>`;
      setStage(root, `${svg('0 0 640 350', `Becherglas mit ${color.name} bei pH ${pH}`, beaker)}${scale}`);
      setReadout(root, [
        { label: 'pH-Wert', value: fmt(pH, 0) },
        { label: 'c(H₃O⁺)', value: `${sci(cH)} mol/L` },
        { label: 'c(OH⁻)', value: `${sci(cOH)} mol/L` },
        { label: 'Indikator', value: `${color.name}: ${color.color}` },
      ]);
      const baseNote = mode === 'acid'
        ? 'Saure Lösung: c(H₃O⁺) > c(OH⁻). Modell für eine starke Säure; pH = −lg c(H₃O⁺).'
        : 'Basische Lösung: c(OH⁻) > c(H₃O⁺). Modell für eine starke Base; pOH = −lg c(OH⁻), pH = 14 − pOH.';
      const indicatorNote = indicator === 'phenolphthalein'
        ? ' Phenolphthalein schlägt bei pH 8,2 von farblos nach pink um.'
        : indicator === 'thymolphthalein'
          ? ' Thymolphthalein schlägt zwischen pH 9,3 und 10,5 von farblos nach blau um.'
          : ' Die Skala zeigt die Farben des Universalindikators.';
      note(root, baseNote + indicatorNote);
    }

    update();
  }

  /* ---------------------------------------------------------------
     8. Titrationsstand
  --------------------------------------------------------------- */
  function titrationTool(root, data) {
    let added = 0;
    const controlsEl = controls(root);
    const action = make('button', 'btn btn--quiet btn--small', '0,5 mL zugeben');
    action.type = 'button';
    const reset = make('button', 'btn btn--quiet btn--small', 'Zurücksetzen');
    reset.type = 'button';
    controlsEl.append(action, reset);

    const slider = document.createElement('label');
    slider.className = 'slider-row';
    slider.innerHTML = '<span>Zugabe an Maßlösung</span><input type="range" min="0" max="40" step="0.5" value="0" aria-label="Zugabe an Maßlösung in Millilitern"><output>0,0 mL</output>';
    controlsEl.append(slider);
    const range = slider.querySelector('input');
    const output = slider.querySelector('output');

    action.addEventListener('click', () => {
      added = Math.min(40, added + 0.5);
      range.value = String(added);
      update();
    });
    reset.addEventListener('click', () => {
      added = 0;
      range.value = '0';
      update();
    });
    range.addEventListener('input', () => {
      added = Number(range.value);
      update();
    });

    function update() {
      const nAnalyte = (data.cAnalyte * data.vAnalyte) / 1000;
      const nTitrant = (data.cTitrant * added) / 1000;
      const totalV = (data.vAnalyte + added) / 1000;
      let pH = 7;
      if (nTitrant < nAnalyte) {
        const cH = (nAnalyte - nTitrant) / totalV;
        pH = -Math.log10(cH);
      } else if (nTitrant > nAnalyte) {
        const cOH = (nTitrant - nAnalyte) / totalV;
        pH = 14 + Math.log10(cOH);
      }
      pH = Math.max(0, Math.min(14, pH));
      const pink = pH >= 8.2;
      const remaining = Math.max(0, 40 - added);
      const liquidHeight = (remaining / 40) * 200;
      const buretteLiquid = `<rect x="123" y="30" width="44" height="${liquidHeight}" class="soft-fill"/>`;
      const flaskLiquid = `<path d="M 398 285 L 386 330 Q 378 344 396 344 L 524 344 Q 542 344 534 330 L 522 285 Z" class="${pink ? 'pink-fill' : 'soft-fill'}"/>`;
      const inner = `
        <rect x="120" y="20" width="50" height="220" class="rule-strong" fill="none"/>
        ${buretteLiquid}
        <line x1="128" y1="30" x2="162" y2="30" class="rule-strong"/>
        <line x1="128" y1="80" x2="162" y2="80" class="rule"/>
        <line x1="128" y1="130" x2="162" y2="130" class="rule"/>
        <line x1="128" y1="180" x2="162" y2="180" class="rule"/>
        <line x1="128" y1="230" x2="162" y2="230" class="rule"/>
        ${text(180, 34, '0', 'label-muted', 'start')}
        ${text(180, 84, '10', 'label-muted', 'start')}
        ${text(180, 134, '20', 'label-muted', 'start')}
        ${text(180, 184, '30', 'label-muted', 'start')}
        ${text(180, 234, '40', 'label-muted', 'start')}
        <line x1="110" y1="130" x2="300" y2="130" class="accent" stroke-dasharray="4 4"/>
        ${text(310, 134, 'Äquivalenz 20,0 mL', 'accent-text', 'start')}
        <rect x="135" y="240" width="20" height="10" class="rule-strong" fill="none"/>
        <line x1="145" y1="250" x2="145" y2="272" class="rule-strong"/>
        ${text(145, 292, 'Bürette', 'label-muted')}
        <path d="M 400 200 L 400 240 L 360 330 Q 350 350 370 350 L 530 350 Q 550 350 540 330 L 500 240 L 500 200 Z" class="rule-strong" fill="none"/>
        ${flaskLiquid}
        ${text(460, 378, 'Phenolphthalein', 'label-muted')}
        ${text(460, 396, 'Erlenmeyerkolben', 'label-muted')}
      `;
      output.textContent = `${fmt(added, 1)} mL`;
      const equivalence = Math.abs(added - 20) < 0.01 ? 'erreicht' : added > 20 ? 'zu spät' : 'noch nicht';
      setStage(root, svg('0 0 640 410', 'Titrationsstand mit Bürette und Erlenmeyerkolben', inner));
      setReadout(root, [
        { label: 'zugegeben', value: `${fmt(added, 1)} mL` },
        { label: 'pH', value: fmt(pH, 1) },
        { label: 'n(NaOH)', value: `${fmt(nTitrant * 1000, 2)} mmol` },
        { label: 'Äquivalenzpunkt', value: equivalence },
      ]);
      note(root, 'HCl + NaOH → NaCl + H₂O. Am Äquivalenzpunkt gilt n(HCl) = n(NaOH); Phenolphthalein schlägt im Basischen um.');
    }

    update();
  }

  /* ---------------------------------------------------------------
     9. Konzentrations-Rechner
  --------------------------------------------------------------- */
  function concentrationTool(root, data) {
    let mode = 'c';
    segment(root, [
      { value: 'c', label: 'c = n / V' },
      { value: 'n', label: 'n = c × V' },
      { value: 'dilute', label: 'Verdünnung' },
    ], mode, (value) => {
      mode = value;
      build();
    }, 'Rechenweg');

    function build() {
      const el = stage(root);
      el.replaceChildren();
      const form = make('div', 'tool__form');
      const fields = make('div', 'calc-grid');
      const result = make('div', 'calc-result');
      result.setAttribute('aria-live', 'polite');
      const help = make('p', 'field__help');
      help.setAttribute('aria-live', 'polite');
      const definitions = mode === 'c'
        ? [{ id: 'n', label: 'Stoffmenge n in mol', value: '0.01' }, { id: 'v', label: 'Volumen V in mL', value: '100' }]
        : mode === 'n'
          ? [{ id: 'c', label: 'Konzentration c in mol/L', value: '0.1' }, { id: 'v', label: 'Volumen V in mL', value: '250' }]
          : [{ id: 'c1', label: 'Ausgangskonzentration c₁ in mol/L', value: '0.5' }, { id: 'v1', label: 'Ausgangsvolumen V₁ in mL', value: '20' }, { id: 'v2', label: 'Zielvolumen V₂ in mL', value: '100' }];
      definitions.forEach((definition) => {
        const field = make('label', 'field');
        field.append(make('span', '', definition.label));
        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.min = '0';
        input.value = definition.value;
        input.dataset.field = definition.id;
        field.append(input);
        fields.append(field);
      });
      const button = make('button', 'btn btn--quiet btn--small', 'Berechnen');
      button.type = 'button';
      button.addEventListener('click', () => {
        const values = {};
        $$('[data-field]', fields).forEach((input) => { values[input.dataset.field] = Number(input.value); });
        const invalid = Object.values(values).some((value) => !Number.isFinite(value) || value <= 0);
        if (invalid) {
          help.textContent = 'Bitte für alle Felder positive Zahlen eingeben.';
          help.className = 'field__help is-error';
          result.replaceChildren();
          return;
        }
        help.textContent = '';
        help.className = 'field__help';
        result.replaceChildren();
        if (mode === 'c') {
          const c = values.n / (values.v / 1000);
          result.append(make('p', '', `c = n / V = ${fmt(values.n, 3)} mol / ${fmt(values.v, 1)} mL`));
          result.append(make('p', '', `c = ${fmt(c, 3)} mol/L`));
        } else if (mode === 'n') {
          const n = (values.c * values.v) / 1000;
          result.append(make('p', '', `n = c × V = ${fmt(values.c, 3)} mol/L × ${fmt(values.v, 1)} mL`));
          result.append(make('p', '', `n = ${fmt(n, 4)} mol`));
        } else {
          const c2 = (values.c1 * values.v1) / values.v2;
          result.append(make('p', '', `c₁ × V₁ = c₂ × V₂`));
          result.append(make('p', '', `c₂ = ${fmt(values.c1, 3)} mol/L × ${fmt(values.v1, 1)} mL / ${fmt(values.v2, 1)} mL = ${fmt(c2, 3)} mol/L`));
        }
      });
      form.append(fields, button, help, result);
      el.append(form);
      note(root, 'n = c × V; c₁ × V₁ = c₂ × V₂. Volumen in mL, Konzentration in mol/L.');
    }

    build();
  }

  /* ---------------------------------------------------------------
     10. Oxidationszahlen
  --------------------------------------------------------------- */
  function oxidationTool(root, data) {
    let current = data.particles[0].id;
    selectField(root, 'Teilchen', data.particles.map((p) => ({ value: p.id, label: p.label })), current, (value) => {
      current = value;
      update();
    });

    function update() {
      const particle = data.particles.find((p) => p.id === current) || data.particles[0];
      const rows = particle.atoms.map((atom) => {
        const contribution = atom.n * atom.value;
        return `<tr><td>${esc(atom.el)}</td><td>${atom.n}</td><td>${esc(atom.ox)}</td><td>${contribution > 0 ? '+' : ''}${contribution}</td></tr>`;
      }).join('');
      const sum = particle.atoms.reduce((acc, atom) => acc + atom.n * atom.value, 0);
      const inner = `
        <table class="data-table">
          <caption>${esc(particle.label)}: Oxidationszahlen der Atome</caption>
          <thead><tr><th>Atom</th><th>Anzahl</th><th>Oxidationszahl</th><th>Beitrag</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      setStage(root, inner);
      setReadout(root, [
        { label: 'Summe', value: String(sum) },
        { label: 'Ladung', value: String(particle.charge) },
        { label: 'Bilanz', value: sum === particle.charge ? 'stimmt' : 'prüfen' },
      ]);
      note(root, particle.note);
    }

    update();
  }

  /* ---------------------------------------------------------------
     11. Redox-Protokoll
  --------------------------------------------------------------- */
  function redoxTool(root, data) {
    let current = data.reactions[0].id;
    let step = 0;
    segment(root, data.reactions.map((r) => ({ value: r.id, label: r.label })), current, (value) => {
      current = value;
      step = 0;
      update();
    }, 'Reaktion wählen');

    const next = make('button', 'btn btn--quiet btn--small', 'Nächster Schritt');
    next.type = 'button';
    const reset = make('button', 'btn btn--quiet btn--small', 'Nochmal');
    reset.type = 'button';
    controls(root).append(next, reset);
    next.addEventListener('click', () => {
      const reaction = data.reactions.find((r) => r.id === current) || data.reactions[0];
      step = Math.min(reaction.steps.length - 1, step + 1);
      update();
    });
    reset.addEventListener('click', () => { step = 0; update(); });

    function update() {
      const reaction = data.reactions.find((r) => r.id === current) || data.reactions[0];
      const currentStep = reaction.steps[step];
      const inner = `
        <div class="redox-step">
          <p class="redox-step__count">Schritt ${step + 1} von ${reaction.steps.length}</p>
          <h4>${esc(currentStep.title)}</h4>
          <p class="equation">${esc(currentStep.equation)}</p>
          <p class="tool__note">${esc(currentStep.note)}</p>
        </div>
      `;
      setStage(root, inner);
      setReadout(root, [
        { label: 'Elektronenbilanz', value: reaction.electron },
        { label: 'Ladungsbilanz', value: currentStep.charge || 'ausgeglichen' },
      ]);
      note(root, reaction.note);
      next.disabled = step >= reaction.steps.length - 1;
      next.textContent = step >= reaction.steps.length - 1 ? 'Letzter Schritt' : 'Nächster Schritt';
    }

    update();
  }

  /* ---------------------------------------------------------------
     12. Alkohol-Oxidation
  --------------------------------------------------------------- */
  function alcoholTool(root, data) {
    let current = data.alcohols[0].id;
    segment(root, data.alcohols.map((a) => ({ value: a.id, label: a.label })), current, (value) => {
      current = value;
      update();
    }, 'Alkohol wählen');

    function update() {
      const alcohol = data.alcohols.find((a) => a.id === current) || data.alcohols[0];
      const rows = [
        ['Stoffklasse', alcohol.class],
        ['Oxidationsprodukt', alcohol.product],
        ['Fehling-Probe', alcohol.fehling],
        ['Silberspiegel-Probe', alcohol.silver],
        ['Schiffsche Probe', alcohol.schiff],
      ].map(([label, value]) => `<tr><td>${esc(label)}</td><td>${esc(value)}</td></tr>`).join('');
      const structures = `<div class="structure-pair">
        <div class="structure-card"><span class="structure-label">Alkohol</span><span class="structure-formula">${esc(alcohol.structure || '')}</span></div>
        <div class="structure-card"><span class="structure-label">Oxidationsprodukt</span><span class="structure-formula">${esc(alcohol.productStructure || '')}</span></div>
      </div>
      <p class="structure-note">C-H-Bindungen sind in der CH₃-/CH₂-Schreibweise zusammengefasst.</p>`;
      setStage(root, `${structures}<table class="data-table"><caption>${esc(alcohol.label)}: Oxidation und Nachweis</caption><tbody>${rows}</tbody></table>`);
      setReadout(root, [
        { label: 'Stoffklasse', value: alcohol.class },
        { label: 'Produkt', value: alcohol.product },
      ]);
      note(root, alcohol.note);
    }

    update();
  }

  /* ---------------------------------------------------------------
     13. Ester-Synthesizer
  --------------------------------------------------------------- */
  function esterTool(root, data) {
    let current = data.examples[0].id;
    selectField(root, 'Beispiel', data.examples.map((e) => ({ value: e.id, label: e.label })), current, (value) => {
      current = value;
      update();
    });

    function update() {
      const example = data.examples.find((e) => e.id === current) || data.examples[0];
      const inner = `
        <div class="ester-eq">
          <p class="equation">${esc(example.acidFormula)} + ${esc(example.alcoholFormula)} ⇌ ${esc(example.esterFormula)} + H₂O</p>
          <p class="ester-name">${esc(example.name)}</p>
          <p class="tool__note">${esc(example.note)}</p>
        </div>
      `;
      setStage(root, inner);
      setReadout(root, [
        { label: 'Ester', value: example.name },
        { label: 'Geruch', value: example.odor },
        { label: 'Edukte', value: `${example.acid} + ${example.alcohol}` },
      ]);
      note(root, 'Säure + Alkohol ⇌ Ester + Wasser. Die Reaktion ist umkehrbar; Wasser muss entfernt werden, damit sie nach rechts läuft.');
    }

    update();
  }

  /* ---------------------------------------------------------------
     14. Esterhydrolyse
  --------------------------------------------------------------- */
  function hydrolysisTool(root, data) {
    let current = data.examples[0].id;
    let mode = 'acid';
    selectField(root, 'Ester', data.examples.map((e) => ({ value: e.id, label: e.label })), current, (value) => {
      current = value;
      update();
    });
    segment(root, [{ value: 'acid', label: 'sauer' }, { value: 'base', label: 'basisch' }], mode, (value) => {
      mode = value;
      update();
    }, 'Bedingungen');

    function update() {
      const example = data.examples.find((e) => e.id === current) || data.examples[0];
      const equation = mode === 'acid' ? example.acidEquation : example.baseEquation;
      const products = mode === 'acid' ? example.acidProducts : example.baseProducts;
      setStage(root, `<p class="equation">${esc(equation)}</p><p class="tool__note">${esc(mode === 'acid' ? example.acidNote : example.baseNote)}</p>`);
      setReadout(root, [
        { label: 'Produkte', value: products },
        { label: 'Reversibel', value: mode === 'acid' ? 'ja' : 'nein' },
      ]);
      note(root, mode === 'acid'
        ? 'Säurekatalysierte Hydrolyse: Die Reaktion ist die Umkehrung der Veresterung und bleibt umkehrbar.'
        : 'Baseninduzierte Hydrolyse: Das Carboxylat ist mesomeriestabilisiert; die Reaktion läuft praktisch vollständig ab.');
    }

    update();
  }

  /* ---------------------------------------------------------------
     Registry and init
  --------------------------------------------------------------- */
  registry.mo = moTool;
  registry.valence = valenceTool;
  registry.epa = epaTool;
  registry.polarity = polarityTool;
  registry.imf = imfTool;
  registry.solubility = solubilityTool;
  registry.ph = phTool;
  registry.titration = titrationTool;
  registry.concentration = concentrationTool;
  registry.oxidation = oxidationTool;
  registry.redox = redoxTool;
  registry.alcohol = alcoholTool;
  registry.ester = esterTool;
  registry.hydrolysis = hydrolysisTool;

  function init(h) {
    helpers = h || {};
    $$('[data-tool]').forEach((root) => {
      const name = root.dataset.tool;
      const dataId = root.dataset.toolData || name;
      const script = document.querySelector(`script[data-tool-data="${dataId}"]`);
      if (!script) return;
      let data;
      try { data = JSON.parse(script.textContent); } catch (_) { return; }
      const tool = registry[name];
      if (tool) tool(root, data);
    });
  }

  window.ChemTools = { init };
})();
