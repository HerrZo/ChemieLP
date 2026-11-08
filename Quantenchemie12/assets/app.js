(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const PAGE = document.body.dataset.page || 'page';
  const KEY = `chem12:${PAGE}:v1`;
  const stations = $$('.station');
  const stationIds = stations.map((s) => s.dataset.station);
  const progressStations = stations.filter((s) => !['start', 'glossar'].includes(s.dataset.station));
  const CHAPTER_COMPETENCIES = {
    lb2: {
      orbital: ['K1', 'K2'],
      valence: ['K1', 'K3'],
      epa: ['K4'],
      hydrocarbons: ['K5'],
      nomenclature: ['K5', 'K6'],
      check: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
    },
    lb3: {
      polarity: ['K1'],
      geometry: ['K1'],
      imf: ['K4'],
      groups: ['K2', 'K3'],
      properties: ['K4', 'K5', 'K6'],
      check: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
    },
    lb4: {
      ph: ['K1', 'K2'],
      proton: ['K3', 'K4', 'K5', 'K6'],
      strength: ['K7'],
      concentration: ['K8'],
      titration: ['K9', 'K10'],
      check: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10'],
    },
    lb5: {
      oxidation: ['K1'],
      redox: ['K2'],
      acidbase: ['K3'],
      alcohol: ['K4', 'K5'],
      ethanol: ['K6', 'K7'],
      check: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7'],
    },
    lb6: {
      sugars: ['K1', 'K2'],
      ester: ['K3'],
      hydrolysis: ['K4', 'K5'],
      mechanism: ['K3', 'K5'],
      products: ['K5'],
      check: ['K1', 'K2', 'K3', 'K4', 'K5'],
    },
    q12: {
      welle: ['K1', 'K2'],
      wahrscheinlichkeit: ['K3', 'K4'],
      unbestimmtheit: ['K5', 'K6'],
      hefteintrag: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
      check: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
    },
  };
  const COMPETENCY_MAP = CHAPTER_COMPETENCIES[PAGE] || {};
  const ALL_COMPETENCIES = [...new Set(Object.values(COMPETENCY_MAP).flat())];
  const totalCompetencies = ALL_COMPETENCIES.length;
  const TERM_TIPS = {
    'Orbital': 'Aufenthaltsraum für Elektronen; keine feste Bahn.',
    'Valenzstrichformel': 'Strukturformel, die bindende und nicht bindende Elektronenpaare zeigt.',
    'Valenzstrichformeln': 'Strukturformeln, die bindende und nicht bindende Elektronenpaare zeigen.',
    'Mesomerie': 'Delokalisierung von Elektronen über mehrere Atome; mehrere Grenzstrukturen.',
    'EPA': 'Elektronenpaarabstoßungsmodell; erklärt den räumlichen Bau von Molekülen.',
    'Konstitutionsisomerie': 'Gleiche Summenformel, andere Verknüpfung der Atome.',
    'Konstitutionsisomere': 'Gleiche Summenformel, andere Verknüpfung der Atome.',
    'E/Z-Isomerie': 'Gleiche Verknüpfung, andere räumliche Anordnung an einer Doppelbindung.',
    'IUPAC': 'Internationale Regeln für eindeutige chemische Namen.',
    'Skelettformel': 'Kohlenstoffkette als Zickzacklinie; C- und H-Atome werden ergänzt.',
    'Elektronegativität': 'Maß für die Anziehung eines Atoms auf Bindungselektronen.',
    'Partialladung': 'Teilladung δ+ oder δ− in einer polaren Bindung.',
    'Partialladungen': 'Teilladungen δ+ oder δ− in einer polaren Bindung.',
    'Dipol': 'Molekül mit getrennten Ladungsschwerpunkten.',
    'London-Dispersions-Wechselwirkung': 'Schwache Anziehung durch spontane und induzierte Dipole.',
    'London-Dispersions-Wechselwirkungen': 'Schwache Anziehung durch spontane und induzierte Dipole.',
    'Wasserstoffbrücke': 'Starke Anziehung zwischen N-H, O-H oder F-H und einem freien Paar an N, O oder F.',
    'Wasserstoffbrücken': 'Starke Anziehung zwischen N-H, O-H oder F-H und einem freien Paar an N, O oder F.',
    'Ion-Dipol-Wechselwirkung': 'Anziehung zwischen einem Ion und einem polaren Molekül.',
    'Ion-Dipol-Wechselwirkungen': 'Anziehung zwischen einem Ion und einem polaren Molekül.',
    'Indikator': 'Stoff, der seine Farbe mit dem pH-Wert ändert.',
    'Indikatoren': 'Stoffe, die ihre Farbe mit dem pH-Wert ändern.',
    'Oxonium-Ion': 'H₃O⁺; entsteht bei der Protonenaufnahme durch Wasser.',
    'Oxonium-Ionen': 'H₃O⁺-Ionen; entstehen bei der Protonenaufnahme durch Wasser.',
    'Hydroxid-Ion': 'OH⁻; entsteht bei der Reaktion einer Base mit Wasser.',
    'Hydroxid-Ionen': 'OH⁻-Ionen; entstehen bei der Reaktion einer Base mit Wasser.',
    'Brønsted': 'Säure ist Protonendonator, Base ist Protonenakzeptor.',
    'Ampholyt': 'Teilchen, das als Säure und als Base reagieren kann.',
    'Äquivalenzpunkt': 'Punkt der Titration, an dem die Stoffmengen im Verhältnis der Koeffizienten stehen.',
    'Titration': 'Verfahren zur Bestimmung einer Konzentration mit einer Maßlösung.',
    'Oxidationszahl': 'Formale Ladung eines Atoms; Hilfszahl zum Erkennen von Redoxreaktionen.',
    'Oxidationszahlen': 'Formale Ladungen von Atomen; Hilfszahlen zum Erkennen von Redoxreaktionen.',
    'Oxidation': 'Abgabe von Elektronen; die Oxidationszahl steigt.',
    'Reduktion': 'Aufnahme von Elektronen; die Oxidationszahl sinkt.',
    'Fehling-Probe': 'Nachweis für Aldehyde; roter Niederschlag aus Kupfer(I)-oxid.',
    'Brennstoffzelle': 'Wandelt chemische Energie direkt in elektrische Energie um.',
    'Anode': 'Elektrode, an der die Oxidation stattfindet.',
    'Kathode': 'Elektrode, an der die Reduktion stattfindet.',
    'Monosaccharid': 'Einfachzucker; nicht weiter in Zuckerbausteine spaltbar.',
    'Monosaccharide': 'Einfachzucker; nicht weiter in Zuckerbausteine spaltbar.',
    'glycosidische Bindung': 'Acetalartige Bindung zwischen zwei Zuckerbausteinen.',
    'Ester': 'Verbindung aus Carbonsäure und Alkohol; Estergruppe -COO-.',
    'Veresterung': 'Kondensation von Carbonsäure und Alkohol zu Ester und Wasser.',
    'Hydrolyse': 'Spaltung einer Verbindung durch Reaktion mit Wasser.',
    'Nukleophil': 'Elektronenreiches Teilchen, das ein Elektronenpaar bereitstellt.',
    'Elektrophil': 'Elektronenarmes Teilchen, das ein Elektronenpaar bindet.',
    'Peptidbindung': 'Säureamidbindung zwischen zwei Aminosäuren.',
    'Katalysator': 'Beschleunigt eine Reaktion, ohne verbraucht zu werden.',
    'Valenzelektronen': 'Elektronen in der äußersten Schale; sie bestimmen die Bindigkeit.',
    'Orbitalmodell': 'Modell, das Elektronen in Orbitalen beschreibt.',
    'Edelgasregel': 'Atome streben die Elektronenkonfiguration des nächsten Edelgases an.',
    'Bindigkeit': 'Zahl der Bindungen, die ein Atom eingeht.',
    'Molekülpolarität': 'Gesamtdipol eines Moleküls aus der Vektorsumme der Bindungsdipole.',
    'funktionelle Gruppe': 'Atomgruppe, die Stoffklasse und Reaktionsverhalten prägt.',
    'Erdölprodukte': 'Produkte aus Erdöl, zum Beispiel Benzin, Diesel oder Kunststoffe.',
    'pH-Skala': 'Skala von 0 bis 14 zur Einordnung des pH-Werts.',
    'Oxonium': 'H₃O⁺; protoniertes Wasser.',
    'Acidität': 'Bereitschaft eines Teilchens, ein Proton abzugeben.',
    'Carbonsäuren': 'Stoffklasse mit der funktionellen Gruppe -COOH.',
    'Neutralisation': 'Reaktion von Oxonium- und Hydroxid-Ionen zu Wasser.',
    'Titrationen': 'Verfahren zur Bestimmung von Konzentrationen mit einer Maßlösung.',
    'Redoxreaktionen': 'Reaktionen mit Elektronenübergang.',
    'Alkohole': 'Stoffklasse mit der funktionellen Gruppe -OH.',
    'Alkoholen': 'Stoffklasse mit der funktionellen Gruppe -OH.',
    'Aldehyde': 'Stoffklasse mit der funktionellen Gruppe -CHO.',
    'Aldehyden': 'Stoffklasse mit der funktionellen Gruppe -CHO.',
    'Ketone': 'Stoffklasse mit einer Carbonylgruppe in der Kohlenstoffkette.',
    'Ketonen': 'Stoffklasse mit einer Carbonylgruppe in der Kohlenstoffkette.',
    'Nachweisreaktionen': 'Reaktionen, die eine Stoffklasse sichtbar machen.',
    'Brennstoffzellen': 'Wandeln chemische Energie direkt in elektrische Energie um.',
    'Zucker': 'Kohlenhydrate; Mono-, Di- und Polysaccharide.',
    'Fette': 'Triester aus Glycerin und Fettsäuren.',
    'Fetten': 'Triester aus Glycerin und Fettsäuren.',
    'Estergruppe': 'Die funktionelle Gruppe -COO-.',
    'Estern': 'Verbindungen aus Carbonsäure und Alkohol.',
    'Reversibilität': 'Umkehrbarkeit einer chemischen Reaktion.',
    'Stoffeigenschaften': 'Eigenschaften wie Siedepunkt, Löslichkeit und Viskosität.',
    'Welle-Teilchen-Dualismus': 'Quantenobjekte zeigen je nach Experiment Wellen- oder Teilcheneigenschaften.',
    'Wellenfunktion': 'ψ beschreibt den Quantenzustand; das Betragsquadrat |ψ|² gibt die Aufenthaltswahrscheinlichkeit an.',
    'Betragsquadrat': '|ψ|²; Wahrscheinlichkeitsdichte dafür, ein Teilchen an einem Ort zu finden.',
    'Wahrscheinlichkeitsdichte': 'Wahrscheinlichkeit pro Volumen; anschaulich die „Dichte“ der Elektronenwolke.',
    'Born-Regel': 'Die Wahrscheinlichkeit, ein Teilchen in einem Bereich zu finden, ist das Integral von |ψ|² über diesen Bereich.',
    'Heisenbergsche Unbestimmtheitsrelation': 'Δx · Δp ≥ h/(4π); Ort und Impuls lassen sich nicht gleichzeitig beliebig genau festlegen.',
    'Unbestimmtheit': 'Grenze der gleichzeitigen Bestimmbarkeit von Ort und Impuls eines Quantenobjekts.',
    'de-Broglie-Wellenlänge': 'λ = h/(m·v); jedem Teilchen mit Impuls ist eine Wellenlänge zugeordnet.',
    'Interferenz': 'Überlagerung von Wellen; gleiche Phase verstärkt, entgegengesetzte Phase schwächt.',
    'Kohärenz': 'Feste Phasenbeziehung zwischen Wellen; Voraussetzung für stabile Interferenz.',
    'Doppelspaltexperiment': 'Zwei schmale Spalte erzeugen ein Interferenzmuster; mit Einzelteilchen baut es sich Treffer für Treffer auf.',
    'Detektor': 'Messgerät, das ein Teilchen lokal nachweist; die Messung erzeugt einen einzelnen Treffer.',
    'Welcher-Weg-Information': 'Kenntnis darüber, welchen Spalt ein Teilchen genommen hat; sie zerstört die Interferenz.',
    'Komplementarität': 'Interferenz und Wegkenntnis schließen sich in einem Experiment gegenseitig aus.',
    'Orbital': 'Aufenthaltsraum eines Elektrons im Atom; beschreibt eine Wahrscheinlichkeitsverteilung, keine feste Bahn.',
    'Atomorbital': 'Lösung der Schrödinger-Gleichung für ein Elektron im Atom; durch Quantenzahlen charakterisiert.',
    'Elektronenwolke': 'Anschauliche Darstellung der Aufenthaltswahrscheinlichkeit von Elektronen.',
    'Knoten': 'Fläche oder Linie, auf der die Wellenfunktion null ist; dort ist die Aufenthaltswahrscheinlichkeit null.',
    'Bohrsches Atommodell': 'Modell mit festen Kreisbahnen; erklärt Spektren teilweise, widerspricht aber der Unbestimmtheit.',
    'Quantenzahl': 'Zahl, die einen Quantenzustand charakterisiert, z. B. Haupt-, Neben-, Magnet- und Spinquantenzahl.',
  };
  const qState = new WeakMap();
  let state = loadState();

  document.documentElement.classList.add('js');

  function loadState() {
    const empty = { completed: [], quiz: {}, check: null };
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty;
      const data = JSON.parse(raw);
      return {
        completed: Array.isArray(data.completed) ? data.completed.filter((id) => stationIds.includes(id)) : [],
        quiz: data.quiz && typeof data.quiz === 'object' ? data.quiz : {},
        check: data.check && typeof data.check === 'object' ? data.check : null,
      };
    } catch (_) {
      return empty;
    }
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* private mode */ }
  }

  function prefersReduced() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function formatDe(n, digits = 1) {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits }).format(n);
  }

  function normalizeAnswer(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[−–—]/g, '-')
      .replace(/[→⟶]/g, '->')
      .replace(/,/g, '.')
      .replace(/\s+/g, '')
      .replace(/[()]/g, '');
  }

  /* ---------------------------------------------------------------
     Navigation
  --------------------------------------------------------------- */
  const sidebar = $('#sidebar');
  const menuBtn = $('[data-menu]');

  function closeMenu() {
    if (!sidebar) return;
    sidebar.classList.remove('is-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    if (!sidebar) return;
    sidebar.classList.add('is-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  }

  function go(id, push = true) {
    if (!stationIds.includes(id)) id = 'start';
    const target = stations.find((s) => s.dataset.station === id);
    if (!target) return;
    stations.forEach((s) => s.classList.toggle('is-active', s === target));
    $$('[data-station-link]').forEach((link) => {
      if (link.dataset.stationLink === id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    closeMenu();
    if (push) {
      window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
      const head = target.querySelector('h1, h2');
      if (head) {
        head.setAttribute('tabindex', '-1');
        head.focus({ preventScroll: true });
        head.removeAttribute('tabindex');
      }
    }
  }

  function initNavigation() {
    if (!stations.length) return;
    $$('[data-station-link]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        go(link.dataset.stationLink);
      });
    });
    $$('[data-go]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        go(link.dataset.go);
      });
    });
    window.addEventListener('hashchange', () => go(location.hash.slice(1) || 'start', false));
    window.addEventListener('popstate', () => go(location.hash.slice(1) || 'start', false));
    const initial = location.hash.slice(1);
    go(stationIds.includes(initial) ? initial : 'start', false);
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!sidebar || !sidebar.classList.contains('is-open')) return;
    if (sidebar.contains(event.target) || (menuBtn && menuBtn.contains(event.target))) return;
    closeMenu();
  });

  /* ---------------------------------------------------------------
     Progress and station completion
  --------------------------------------------------------------- */
  function completedCompetencies() {
    const done = new Set();
    state.completed.forEach((stationId) => {
      (COMPETENCY_MAP[stationId] || []).forEach((competency) => done.add(competency));
    });
    return done;
  }

  function completedCount() {
    return completedCompetencies().size;
  }

  function updateProgress() {
    const count = completedCount();
    $$('[data-progress-text]').forEach((el) => { el.textContent = `${count} / ${totalCompetencies}`; });
    $$('[data-progress-inline]').forEach((el) => { el.textContent = `${count} von ${totalCompetencies}`; });
    $$('[data-progress-bar]').forEach((el) => {
      el.style.setProperty('--p', totalCompetencies ? String(count / totalCompetencies) : '0');
    });
    stations.forEach((station) => {
      const id = station.dataset.station;
      const done = state.completed.includes(id);
      const link = document.querySelector(`[data-station-link="${id}"]`);
      if (link) link.classList.toggle('is-done', done);
      const status = station.querySelector('[data-station-status]');
      if (status) {
        status.textContent = done ? 'Station abgeschlossen.' : '';
        status.classList.toggle('is-done', done);
      }
      const button = station.querySelector('[data-complete]');
      if (button) {
        button.textContent = done ? 'Station abgeschlossen' : 'Station abschließen';
        button.disabled = done;
      }
    });
    const checkLink = document.querySelector('[data-station-link="check"]');
    if (checkLink && state.check) checkLink.classList.add('is-done');
  }

  function initCompletion() {
    $$('[data-complete]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.complete;
        if (!state.completed.includes(id)) {
          state.completed.push(id);
          saveState();
          updateProgress();
        }
      });
    });
  }

  function initReset() {
    const dialog = $('#resetDialog');
    $$('[data-reset-open]').forEach((button) => {
      button.addEventListener('click', () => {
        if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
        else if (window.confirm('Lernstand zurücksetzen? Alle lokalen Ergebnisse dieser Seite werden gelöscht.')) resetPage();
      });
    });
    const cancel = $('[data-reset-cancel]');
    if (cancel && dialog) cancel.addEventListener('click', () => dialog.close());
    const confirm = $('[data-reset-confirm]');
    if (confirm) confirm.addEventListener('click', resetPage);
    function resetPage() {
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem('chem12:q12:heft:v1');
      } catch (_) { /* private mode */ }
      location.hash = 'start';
      location.reload();
    }
  }

  /* ---------------------------------------------------------------
     Quiz rendering
  --------------------------------------------------------------- */
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function questionMeta(index, question, total) {
    const meta = make('div', 'quiz__meta');
    meta.append(make('span', '', `Frage ${index + 1} von ${total}`));
    const parts = [];
    if (question.level) parts.push(`AFB ${question.level}`);
    if (question.competency) parts.push(question.competency);
    meta.append(make('span', '', parts.join(', ')));
    return meta;
  }

  function renderQuestion(question, index, total, quizId, mode) {
    const fieldset = make('fieldset', 'quiz__question');
    fieldset.dataset.qid = question.id || `q${index + 1}`;
    fieldset.append(make('legend', 'visually-hidden', `Frage ${index + 1}`));
    fieldset.append(questionMeta(index, question, total));
    fieldset.append(make('p', 'quiz__prompt', question.prompt));

    if (question.type === 'mc' || question.type === 'multi' || question.type === 'tf') {
      const options = question.type === 'tf' ? ['Richtig', 'Falsch'] : question.options;
      const optionWrap = make('div', 'quiz__options');
      options.forEach((option, optionIndex) => {
        const label = make('label', 'quiz__option');
        const input = document.createElement('input');
        input.type = question.type === 'multi' ? 'checkbox' : 'radio';
        input.name = `${quizId}-${question.id || index}-${optionIndex}`;
        input.value = String(optionIndex);
        label.append(input, make('span', '', option));
        optionWrap.append(label);
      });
      fieldset.append(optionWrap);
    } else if (question.type === 'input') {
      const label = make('label', 'visually-hidden', 'Deine Antwort');
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'quiz__input';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.placeholder = question.placeholder || 'Antwort eingeben';
      input.id = `${quizId}-${question.id || index}-input`;
      label.htmlFor = input.id;
      fieldset.append(label, input);
    } else if (question.type === 'match') {
      const rows = make('div', 'quiz__match');
      question.left.forEach((left, leftIndex) => {
        const row = make('div', 'match-row');
        const label = make('label', '', left);
        label.htmlFor = `${quizId}-${question.id || index}-${leftIndex}`;
        const select = document.createElement('select');
        select.id = label.htmlFor;
        select.dataset.matchIndex = String(leftIndex);
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Bitte wählen';
        select.append(placeholder);
        question.right.forEach((right, rightIndex) => {
          const option = document.createElement('option');
          option.value = String(rightIndex);
          option.textContent = right;
          select.append(option);
        });
        row.append(label, select);
        rows.append(row);
      });
      fieldset.append(rows);
    } else if (question.type === 'order') {
      const list = make('ol', 'order-list');
      const start = Array.isArray(question.start) ? question.start : question.items.map((_, i) => i);
      start.forEach((itemIndex) => {
        const item = make('li', 'order-item');
        item.dataset.index = String(itemIndex);
        item.append(make('span', '', question.items[itemIndex]));
        const up = make('button', '', '↑');
        up.type = 'button';
        up.setAttribute('aria-label', 'Nach oben');
        up.addEventListener('click', () => {
          const previous = item.previousElementSibling;
          if (previous) list.insertBefore(item, previous);
        });
        const down = make('button', '', '↓');
        down.type = 'button';
        down.setAttribute('aria-label', 'Nach unten');
        down.addEventListener('click', () => {
          const next = item.nextElementSibling;
          if (next) list.insertBefore(next, item);
        });
        item.append(up, down);
        list.append(item);
      });
      fieldset.append(list);
    }

    if (mode === 'station') {
      const actions = make('div', 'quiz__actions');
      const check = make('button', 'btn btn--quiet btn--small', 'Prüfen');
      check.type = 'button';
      check.dataset.checkQuestion = 'true';
      const retry = make('button', 'btn btn--quiet btn--small', 'Nochmal');
      retry.type = 'button';
      retry.dataset.retryQuestion = 'true';
      retry.hidden = true;
      actions.append(check, retry);
      fieldset.append(actions);
    }

    const feedback = make('div', 'quiz__feedback');
    feedback.hidden = true;
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    fieldset.append(feedback);

    qState.set(fieldset, { question, answered: false, correct: false, mode });

    if (mode === 'station') {
      fieldset.querySelector('[data-check-question]').addEventListener('click', () => {
        evaluateQuestion(fieldset);
        updateStationSummary(fieldset.closest('.quiz'));
      });
      fieldset.querySelector('[data-retry-question]').addEventListener('click', () => {
        resetQuestion(fieldset);
        updateStationSummary(fieldset.closest('.quiz'));
      });
    }

    return fieldset;
  }

  function correctText(question) {
    if (question.type === 'mc') return question.options[question.correct];
    if (question.type === 'multi') return question.correct.map((i) => question.options[i]).join(', ');
    if (question.type === 'tf') return question.correct ? 'Richtig' : 'Falsch';
    if (question.type === 'input') return question.model || (question.accept && question.accept[0]) || '';
    if (question.type === 'match') {
      return question.left.map((left, index) => `${left}: ${question.right[question.correct[index]]}`).join('; ');
    }
    if (question.type === 'order') return question.items.join(', ');
    return '';
  }

  function evaluateQuestion(fieldset) {
    const entry = qState.get(fieldset);
    if (!entry) return false;
    const question = entry.question;
    let correct = false;
    let given = null;

    if (question.type === 'mc' || question.type === 'tf') {
      const selected = fieldset.querySelector('input:checked');
      const selectedIndex = selected ? Number(selected.value) : -1;
      const correctIndex = question.type === 'tf' ? (question.correct ? 0 : 1) : question.correct;
      correct = selectedIndex === correctIndex;
      given = selectedIndex;
    } else if (question.type === 'multi') {
      const selected = $$('input:checked', fieldset).map((input) => Number(input.value)).sort((a, b) => a - b);
      const expected = [...question.correct].sort((a, b) => a - b);
      correct = selected.length === expected.length && selected.every((value, index) => value === expected[index]);
      given = selected;
    } else if (question.type === 'input') {
      const input = fieldset.querySelector('.quiz__input');
      const value = input ? input.value : '';
      const accepted = (question.accept || (question.model ? [question.model] : [])).map(normalizeAnswer);
      correct = value.trim().length > 0 && accepted.includes(normalizeAnswer(value));
      given = value;
      if (input) input.setAttribute('aria-invalid', correct ? 'false' : 'true');
    } else if (question.type === 'match') {
      const selects = $$('select', fieldset);
      correct = selects.every((select, index) => {
        const expected = Array.isArray(question.correct) ? question.correct[index] : question.correct[select.dataset.matchIndex];
        return select.value !== '' && Number(select.value) === Number(expected);
      });
      given = selects.map((select) => select.value);
      selects.forEach((select) => {
        const expected = Array.isArray(question.correct) ? question.correct[Number(select.dataset.matchIndex)] : question.correct[select.dataset.matchIndex];
        select.setAttribute('aria-invalid', select.value !== '' && Number(select.value) === Number(expected) ? 'false' : 'true');
      });
    } else if (question.type === 'order') {
      const items = $$('.order-item', fieldset);
      correct = items.every((item, index) => Number(item.dataset.index) === index);
      given = items.map((item) => Number(item.dataset.index));
      items.forEach((item, index) => {
        item.classList.toggle('is-correct', Number(item.dataset.index) === index);
        item.classList.toggle('is-wrong', Number(item.dataset.index) !== index);
      });
    }

    entry.answered = true;
    entry.correct = correct;
    entry.given = given;
    markQuestion(fieldset, question, correct);
    showFeedback(fieldset, question, correct);
    return correct;
  }

  function markQuestion(fieldset, question, correct) {
    if (question.type === 'mc' || question.type === 'multi' || question.type === 'tf') {
      const labels = $$('.quiz__option', fieldset);
      const correctIndexes = question.type === 'tf'
        ? [question.correct ? 0 : 1]
        : (question.type === 'multi' ? question.correct : [question.correct]);
      labels.forEach((label, index) => {
        const input = label.querySelector('input');
        const isCorrect = correctIndexes.includes(index);
        const isSelected = input && input.checked;
        label.classList.toggle('is-correct', isCorrect);
        label.classList.toggle('is-wrong', isSelected && !isCorrect);
      });
    }
  }

  function showFeedback(fieldset, question, correct) {
    const feedback = fieldset.querySelector('.quiz__feedback');
    if (!feedback) return;
    feedback.replaceChildren();
    feedback.classList.toggle('is-wrong', !correct);
    feedback.hidden = false;
    const title = make('strong', '', correct ? 'Richtig.' : 'Noch nicht.');
    feedback.append(title);
    if (!correct) {
      feedback.append(make('p', '', `Richtig ist: ${correctText(question)}`));
    }
    if (question.explain) feedback.append(make('p', '', question.explain));
    const retry = fieldset.querySelector('[data-retry-question]');
    const check = fieldset.querySelector('[data-check-question]');
    if (retry) retry.hidden = false;
    if (check) check.hidden = true;
  }

  function resetQuestion(fieldset) {
    const entry = qState.get(fieldset);
    if (!entry) return;
    entry.answered = false;
    entry.correct = false;
    entry.given = null;
    $$('input', fieldset).forEach((input) => {
      if (input.type === 'radio' || input.type === 'checkbox') input.checked = false;
      else input.value = '';
      input.setAttribute('aria-invalid', 'false');
    });
    $$('select', fieldset).forEach((select) => {
      select.value = '';
      select.setAttribute('aria-invalid', 'false');
    });
    $$('.quiz__option', fieldset).forEach((label) => label.classList.remove('is-correct', 'is-wrong'));
    $$('.order-item', fieldset).forEach((item) => item.classList.remove('is-correct', 'is-wrong'));
    const feedback = fieldset.querySelector('.quiz__feedback');
    if (feedback) {
      feedback.hidden = true;
      feedback.replaceChildren();
    }
    const retry = fieldset.querySelector('[data-retry-question]');
    const check = fieldset.querySelector('[data-check-question]');
    if (retry) retry.hidden = true;
    if (check) check.hidden = false;
  }

  function updateStationSummary(container) {
    if (!container) return;
    const fieldsets = $$('.quiz__question', container);
    if (!fieldsets.length) return;
    const answered = fieldsets.filter((fieldset) => qState.get(fieldset)?.answered);
    const correct = answered.filter((fieldset) => qState.get(fieldset)?.correct);
    let summary = container.querySelector('.quiz__summary');
    if (!summary) {
      summary = make('div', 'quiz__summary');
      container.append(summary);
    }
    if (!answered.length) {
      summary.hidden = true;
      return;
    }
    summary.hidden = false;
    summary.replaceChildren(make('b', '', `${correct.length} / ${fieldsets.length}`), make('span', '', ' richtig.'));
    if (answered.length < fieldsets.length) summary.append(make('span', '', ' Noch nicht alle Aufgaben geprüft.'));
    else summary.append(make('span', '', ' Prüfpunkt vollständig bearbeitet.'));
    const id = container.dataset.quiz;
    if (id) {
      state.quiz[id] = { score: correct.length, total: fieldsets.length, at: Date.now() };
      saveState();
    }
  }

  function initStationQuiz(container, id, data) {
    container.replaceChildren();
    data.questions.forEach((question, index) => {
      container.append(renderQuestion(question, index, data.questions.length, id, 'station'));
    });
    const previous = state.quiz[id];
    if (previous && Number.isFinite(previous.score)) {
      const summary = make('div', 'quiz__summary');
      summary.append(make('b', '', `${previous.score} / ${previous.total}`), make('span', '', ' richtig beim letzten Durchgang.'));
      container.append(summary);
    }
  }

  /* ---------------------------------------------------------------
     Kompetenzcheck
  --------------------------------------------------------------- */
  function initCheck(container, id, data) {
    container.replaceChildren();
    const competencies = data.competencies || [];
    const bars = $('[data-check-bars]');
    if (bars) {
      bars.replaceChildren();
      competencies.forEach((competency) => {
        const row = make('div', 'competency-result');
        row.dataset.comp = competency.id;
        const label = make('span', '', competency.label);
        const track = make('div', 'cbar');
        const fill = document.createElement('i');
        fill.style.setProperty('--p', '0');
        track.append(fill);
        row.append(label, track);
        bars.append(row);
      });
    }

    data.questions.forEach((question, index) => {
      container.append(renderQuestion(question, index, data.questions.length, id, 'check'));
    });

    const actions = make('div', 'quiz__actions');
    const evaluate = make('button', 'btn', 'Auswerten');
    evaluate.type = 'button';
    const reset = make('button', 'btn btn--quiet', 'Antworten zurücksetzen');
    reset.type = 'button';
    actions.append(evaluate, reset);
    container.append(actions);

    function setBars(byComp) {
      if (!bars) return;
      competencies.forEach((competency) => {
        const row = bars.querySelector(`[data-comp="${competency.id}"]`);
        if (!row) return;
        const result = byComp && byComp[competency.id];
        const ratio = result && result.total ? result.correct / result.total : 0;
        row.querySelector('i').style.setProperty('--p', String(ratio));
        const existing = row.querySelector('.comp-score');
        const text = result ? `${result.correct} / ${result.total}` : '0 / 0';
        if (existing) existing.textContent = text;
        else row.append(make('span', 'comp-score', text));
      });
    }

    function showStored() {
      const scoreEl = $('[data-check-score]');
      const textEl = $('[data-check-text]');
      if (state.check && state.check.best) {
        const best = state.check.best;
        if (scoreEl) scoreEl.textContent = `${best.score} / ${best.total}`;
        if (textEl) {
          const last = state.check.last;
          textEl.textContent = last
            ? `Bestwert: ${best.score} von ${best.total}. Letzte Auswertung: ${last.score} von ${last.total}.`
            : `Bestwert: ${best.score} von ${best.total}.`;
        }
        setBars(best.byComp);
      } else {
        if (scoreEl) scoreEl.textContent = `0 / ${data.questions.length}`;
        if (textEl) textEl.textContent = 'Beantworte alle Aufgaben und werte dann aus. Jede Aufgabe zählt einen Punkt.';
        setBars(null);
      }
    }

    evaluate.addEventListener('click', () => {
      let score = 0;
      const byComp = {};
      data.questions.forEach((question) => {
        const fieldset = container.querySelector(`[data-qid="${question.id}"]`) || $$('.quiz__question', container).find((el) => qState.get(el)?.question === question);
        if (!fieldset) return;
        const correct = evaluateQuestion(fieldset);
        if (correct) score += 1;
        const key = question.competency || 'all';
        if (!byComp[key]) byComp[key] = { correct: 0, total: 0 };
        byComp[key].total += 1;
        if (correct) byComp[key].correct += 1;
      });
      const total = data.questions.length;
      const previous = state.check && state.check.best ? state.check.best : null;
      const best = previous && previous.score >= score ? previous : { score, total, byComp };
      state.check = {
        best,
        last: { score, total, byComp },
        at: Date.now(),
      };
      if (!state.completed.includes('check')) state.completed.push('check');
      saveState();
      updateProgress();
      setBars(byComp);
      const scoreEl = $('[data-check-score]');
      const textEl = $('[data-check-text]');
      const resultEl = $('[data-check-result]');
      if (scoreEl) scoreEl.textContent = `${best.score} / ${best.total}`;
      if (textEl) {
        textEl.textContent = `Letzte Auswertung: ${score} von ${total}. Bestwert: ${best.score} von ${best.total}.`;
      }
      if (resultEl) {
        resultEl.hidden = false;
        resultEl.replaceChildren();
        resultEl.append(make('p', '', score === total
          ? 'Alle Aufgaben richtig. Die Kompetenzen dieses Lernbereichs sitzen.'
          : score >= Math.ceil(total * 0.67)
            ? 'Du hast die meisten Aufgaben richtig. Lies bei den markierten Aufgaben die Rückmeldung noch einmal.'
            : 'Mehrere Aufgaben sind noch offen. Arbeite die Rückmeldungen durch und wiederhole die passenden Stationen.'));
        resultEl.append(make('p', '', 'Nicht beantwortete Aufgaben zählen als nicht richtig. Du kannst die Aufgaben zurücksetzen und erneut auswerten.'));
      }
      const summary = container.querySelector('.quiz__summary');
      if (summary) summary.remove();
      const quizSummary = make('div', 'quiz__summary');
      quizSummary.append(make('b', '', `${score} / ${total}`), make('span', '', ' richtig in dieser Auswertung.'));
      container.append(quizSummary);
    });

    reset.addEventListener('click', () => {
      $$('.quiz__question', container).forEach((fieldset) => resetQuestion(fieldset));
      const summary = container.querySelector('.quiz__summary');
      if (summary) summary.remove();
      const resultEl = $('[data-check-result]');
      if (resultEl) resultEl.hidden = true;
      showStored();
    });

    showStored();
  }

  function initQuizzes() {
    $$('.quiz[data-quiz]').forEach((container) => {
      const id = container.dataset.quiz;
      const script = document.querySelector(`script[data-quiz-data="${id}"]`);
      if (!script) return;
      let data;
      try { data = JSON.parse(script.textContent); } catch (_) { return; }
      if (data.final) initCheck(container, id, data);
      else initStationQuiz(container, id, data);
    });
  }

  /* ---------------------------------------------------------------
     Glossary
  --------------------------------------------------------------- */
  function initGlossary() {
    const input = $('[data-glossary-search]');
    const list = $('[data-glossary]');
    const count = $('[data-glossary-count]');
    const empty = $('[data-glossary-empty]');
    if (!input || !list) return;
    const terms = $$('.term', list);
    if (count) count.textContent = String(terms.length);
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      terms.forEach((term) => {
        const text = term.textContent.toLowerCase();
        const show = !query || text.includes(query);
        term.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = String(visible);
      if (empty) empty.hidden = visible !== 0;
    });
  }

  /* ---------------------------------------------------------------
     Hub
  --------------------------------------------------------------- */
  function initStartCTA() {
    const cta = document.querySelector('[data-start-cta]');
    if (!cta) return;
    const next = progressStations.find((station) => !state.completed.includes(station.dataset.station));
    if (next) {
      cta.href = `#${next.dataset.station}`;
      cta.dataset.go = next.dataset.station;
      cta.textContent = state.completed.length ? 'Weiterlernen' : 'Erste Station öffnen';
    } else {
      cta.href = '#check';
      cta.dataset.go = 'check';
      cta.textContent = 'Kompetenzcheck öffnen';
    }
  }

  function initTermTips() {
    const terms = Object.keys(TERM_TIPS).sort((a, b) => b.length - a.length);
    const used = new Set();
    function applyTips(roots, max) {
      let count = 0;
      roots.forEach((root) => {
        if (count >= max || !root.isConnected) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent || parent.closest('.term-tip, h1, h2, h3, h4, a, button, code, svg, .quiz, .tool')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        const queue = [];
        while (walker.nextNode()) queue.push(walker.currentNode);
        while (queue.length && count < max) {
          const node = queue.shift();
          if (!node.isConnected || !node.parentNode) continue;
          for (const term of terms) {
            if (used.has(term)) continue;
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=[^\\p{L}\\p{N}]|$)`, 'u');
            const match = re.exec(node.nodeValue);
            if (!match) continue;
            const start = match.index + match[1].length;
            const end = start + term.length;
            const span = document.createElement('span');
            span.className = 'term-tip';
            span.tabIndex = 0;
            span.dataset.tip = TERM_TIPS[term];
            span.setAttribute('aria-label', `${term}: ${TERM_TIPS[term]}`);
            span.textContent = node.nodeValue.slice(start, end);
            const before = node.nodeValue.slice(0, start);
            const after = node.nodeValue.slice(end);
            const parent = node.parentNode;
            const beforeNode = document.createTextNode(before);
            const afterNode = document.createTextNode(after);
            parent.insertBefore(beforeNode, node);
            parent.insertBefore(span, node);
            parent.insertBefore(afterNode, node);
            parent.removeChild(node);
            used.add(term);
            count += 1;
            if (afterNode.nodeValue.trim()) queue.unshift(afterNode);
            if (beforeNode.nodeValue.trim()) queue.unshift(beforeNode);
            break;
          }
        }
      });
    }
    applyTips($$('#start .competencies li, #start .note p'), 6);
    applyTips($$('.station:not(#start) .station__head .lead, .station:not(#start) .protocol__main p, .station:not(#start) .protocol__main li, .station:not(#start) .protocol__main dd, .station:not(#start) .note p, .station:not(#start) .note dd'), 8);
  }

  function initHub() {
    const chapters = [
      { key: 'lb2', id: 'lb2', stations: ['orbital', 'valence', 'epa', 'hydrocarbons', 'nomenclature', 'check'] },
      { key: 'lb3', id: 'lb3', stations: ['polarity', 'geometry', 'imf', 'groups', 'properties', 'check'] },
      { key: 'lb4', id: 'lb4', stations: ['ph', 'proton', 'strength', 'concentration', 'titration', 'check'] },
      { key: 'lb5', id: 'lb5', stations: ['oxidation', 'redox', 'acidbase', 'alcohol', 'ethanol', 'check'] },
      { key: 'lb6', id: 'lb6', stations: ['sugars', 'ester', 'hydrolysis', 'mechanism', 'products', 'check'] },
    ];
    let totalDone = 0;
    let totalAll = 0;
    let firstOpenHref = null;
    chapters.forEach(({ key, id, stations }) => {
      let completed = [];
      try {
        const raw = localStorage.getItem(`chem10:${key}:v1`);
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data.completed)) completed = data.completed;
        }
      } catch (_) { /* private mode */ }
      const map = CHAPTER_COMPETENCIES[key] || {};
      const all = [...new Set(Object.values(map).flat())];
      const done = new Set();
      completed.forEach((station) => (map[station] || []).forEach((competency) => done.add(competency)));
      const count = done.size;
      const total = all.length;
      totalDone += count;
      totalAll += total;
      const progress = document.querySelector(`[data-hub-progress="${id}"]`);
      if (progress) progress.textContent = `${count} / ${total}`;
      const bar = document.querySelector(`[data-hub-bar="${id}"]`);
      if (bar) bar.style.setProperty('--p', String(total ? count / total : 0));
      const chapter = document.querySelector(`[data-chapter="${id}"]`);
      if (chapter) chapter.classList.toggle('is-done', count >= total);
      if (!firstOpenHref && count < total) {
        const base = chapter ? chapter.querySelector('a')?.getAttribute('href') : null;
        if (base) {
          if (!completed.length) firstOpenHref = base;
          else {
            const next = stations.find((station) => !completed.includes(station)) || 'check';
            firstOpenHref = `${base}#${next}`;
          }
        }
      }
    });
    const totalEl = document.querySelector('[data-hub-total]');
    if (totalEl) totalEl.textContent = `${totalDone} / ${totalAll}`;
    const continueLink = document.querySelector('[data-continue]');
    if (continueLink && firstOpenHref) continueLink.href = firstOpenHref;
    if (continueLink && !firstOpenHref) {
      continueLink.textContent = 'Nochmal wiederholen';
      continueLink.href = '10-2-molekuele.html';
    }
  }

  /* ---------------------------------------------------------------
     Init
  --------------------------------------------------------------- */
  initStartCTA();
  initNavigation();
  initCompletion();
  initReset();
  initQuizzes();
  initGlossary();
  initTermTips();
  initHub();
  updateProgress();
  if (window.ChemTools && typeof window.ChemTools.init === 'function') {
    window.ChemTools.init({ formatDe, normalizeAnswer, prefersReduced });
  }
})();
