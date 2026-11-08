(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const KEY = 'chem12:q12:heft:v1';

  const root = $('#hefteintrag');
  if (!root) return;

  const steps = $$('[data-heft-step]', root);
  const inputs = steps.map((step) => $('[data-heft-input]', step)).filter(Boolean);
  const progressText = $('[data-heft-progress-text]', root);
  const progressBar = $('[data-heft-progress-bar]', root);
  const saveStatus = $('[data-heft-save]', root);
  const model = $('[data-heft-model]', root);
  const modelToggle = $('[data-heft-model-toggle]', root);
  const printRoot = $('#heft-print');
  const resetDialog = $('#heftResetDialog');

  let saveTimer = null;
  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { entries: {} };
      const data = JSON.parse(raw);
      return {
        entries: data && typeof data.entries === 'object' && data.entries ? data.entries : {},
      };
    } catch (_) {
      return { entries: {} };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ entries: state.entries, updated: Date.now() }));
    } catch (_) { /* private mode */ }
  }

  function words(value) {
    const text = String(value || '').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }

  function wordLabel(count) {
    return `${count} ${count === 1 ? 'Wort' : 'Wörter'}`;
  }

  function setSaveStatus(text) {
    if (saveStatus) saveStatus.textContent = text;
  }

  function autoGrow(input) {
    input.style.height = 'auto';
    input.style.height = `${Math.min(Math.max(input.scrollHeight, 132), 560)}px`;
  }

  function updateStep(step, input) {
    const count = words(input.value);
    const countEl = $('[data-heft-count]', step);
    if (countEl) countEl.textContent = wordLabel(count);
    step.classList.toggle('is-filled', count > 0);
  }

  function updateProgress() {
    const filled = inputs.filter((input) => words(input.value) > 0).length;
    if (progressText) progressText.textContent = `${filled} / ${steps.length} Schritte`;
    if (progressBar) progressBar.style.setProperty('--p', String(steps.length ? filled / steps.length : 0));
  }

  function saveNow() {
    if (saveTimer) {
      window.clearTimeout(saveTimer);
      saveTimer = null;
    }
    saveState();
    setSaveStatus('Automatisch gespeichert.');
  }

  function scheduleSave() {
    if (saveTimer) window.clearTimeout(saveTimer);
    setSaveStatus('Speichert …');
    saveTimer = window.setTimeout(saveNow, 300);
  }

  function initInputs() {
    steps.forEach((step) => {
      const input = $('[data-heft-input]', step);
      if (!input) return;
      const id = input.dataset.heftInput;
      const stored = state.entries[id];
      if (typeof stored === 'string') input.value = stored;
      autoGrow(input);
      updateStep(step, input);
      input.addEventListener('input', () => {
        state.entries[id] = input.value;
        updateStep(step, input);
        updateProgress();
        autoGrow(input);
        scheduleSave();
      });
      input.addEventListener('blur', saveNow);
    });
    updateProgress();
    const hasEntries = inputs.some((input) => words(input.value) > 0);
    setSaveStatus(hasEntries ? 'Dein Hefteintrag wurde geladen.' : 'Die Texte werden automatisch im Browser gespeichert.');
  }

  function initSamples() {
    $$('[data-heft-sample-toggle]', root).forEach((button) => {
      const id = button.getAttribute('aria-controls');
      const sample = id ? document.getElementById(id) : null;
      if (!sample) return;
      button.addEventListener('click', () => {
        const open = sample.hidden;
        sample.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        button.textContent = open ? 'Musterantwort ausblenden' : 'Musterantwort zeigen';
      });
    });
  }

  function initModel() {
    if (!model || !modelToggle) return;
    modelToggle.addEventListener('click', () => {
      const open = model.hidden;
      model.hidden = !open;
      modelToggle.setAttribute('aria-expanded', String(open));
      modelToggle.textContent = open ? 'Musterhefteintrag ausblenden' : 'Musterhefteintrag anzeigen';
      if (open) model.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function initReset() {
    if (!resetDialog) return;
    const open = $('[data-heft-reset-open]', root);
    const cancel = $('[data-heft-reset-cancel]', resetDialog);
    const confirm = $('[data-heft-reset-confirm]', resetDialog);

    function clearEntries() {
      state = { entries: {} };
      inputs.forEach((input) => {
        input.value = '';
        autoGrow(input);
      });
      steps.forEach((step) => {
        const input = $('[data-heft-input]', step);
        if (input) updateStep(step, input);
      });
      updateProgress();
      saveState();
      setSaveStatus('Eintrag gelöscht. Du kannst neu beginnen.');
    }

    if (open) {
      open.addEventListener('click', () => {
        if (typeof resetDialog.showModal === 'function') resetDialog.showModal();
        else if (window.confirm('Deinen Hefteintrag zurücksetzen? Die selbst formulierten Texte werden gelöscht.')) clearEntries();
      });
    }
    if (cancel) cancel.addEventListener('click', () => resetDialog.close());
    if (confirm) {
      confirm.addEventListener('click', () => {
        clearEntries();
        resetDialog.close();
      });
    }
  }

  function addPrintHead(kind) {
    const head = document.createElement('div');
    head.className = 'heft-print__head';
    const kicker = document.createElement('p');
    kicker.className = 'heft-print__kicker';
    kicker.textContent = 'Quantenchemie 12 · Buchseite 3.2.2';
    const title = document.createElement('h1');
    title.textContent = kind === 'model'
      ? 'Musterhefteintrag: Von Wellen und Teilchen'
      : 'Mein Hefteintrag: Von Wellen und Teilchen';
    const meta = document.createElement('p');
    meta.className = 'heft-print__meta';
    meta.textContent = kind === 'model'
      ? 'Musterlösung – zum Vergleichen, nicht zum Abschreiben.'
      : 'Name: ______________________________   Datum: __________________';
    head.append(kicker, title, meta);
    return head;
  }

  function buildPrint(kind) {
    if (!printRoot) return;
    printRoot.replaceChildren();
    printRoot.append(addPrintHead(kind));

    if (kind === 'model') {
      const body = $('.heft-model__body', model);
      if (body) {
        const clone = body.cloneNode(true);
        clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
        printRoot.append(clone);
      }
      return;
    }

    steps.forEach((step, index) => {
      const input = $('[data-heft-input]', step);
      const heading = $('h3', step);
      if (!input || !heading) return;
      const section = document.createElement('section');
      section.className = 'heft-print__step';
      const h2 = document.createElement('h2');
      h2.textContent = `${index + 1}. ${heading.textContent.trim()}`;
      const answer = document.createElement('div');
      answer.className = 'heft-print__answer';
      const value = input.value.trim();
      if (value) {
        answer.textContent = value;
      } else {
        answer.textContent = '— noch nicht ausgefüllt —';
        answer.classList.add('is-empty');
      }
      section.append(h2, answer);
      printRoot.append(section);
    });
  }

  function print(kind) {
    buildPrint(kind);
    document.body.classList.add('is-printing-heft');
    const cleanup = () => {
      document.body.classList.remove('is-printing-heft');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    window.setTimeout(cleanup, 1500);
  }

  function initPrint() {
    $$('[data-heft-print]', root).forEach((button) => {
      button.addEventListener('click', () => print(button.dataset.heftPrint));
    });
  }

  function initCompletionGuard() {
    const button = $('[data-complete="hefteintrag"]', root);
    if (!button) return;
    button.addEventListener('click', (event) => {
      const filled = inputs.filter((input) => words(input.value) > 0).length;
      if (filled >= 3) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setSaveStatus(`Bearbeite zuerst mindestens drei Schritte (${filled} / 6), bevor du die Station abschließt.`);
      const firstEmpty = inputs.find((input) => words(input.value) === 0);
      if (firstEmpty) firstEmpty.focus();
    }, true);
  }

  initInputs();
  initCompletionGuard();
  initSamples();
  initModel();
  initReset();
  initPrint();

  // For testing and for a possible later export integration.
  window.HefteintragPrint = { buildPrint, print };
})();
