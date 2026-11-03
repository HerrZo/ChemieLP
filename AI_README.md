# ChemieLP - AI Architecture & Guidelines

## 1. Project Overview & Philosophy
ChemieLP ist das zentrale Chemie-Lehrplan- und Lernpfad-Portal für das Johannes-Scharrer-Gymnasium. Es bietet eine strukturierte Übersicht über alle Themen des Fachs Chemie (Jahrgangsstufen 8 bis 13 am NTG und SG nach LehrplanPLUS Bayern) und verlinkt auf die jeweiligen Unterseiten der einzelnen Jahrgangsstufen und Lernbereiche (wie z. B. `SGChemie10/`).

Die Architektur entspricht exakt dem bewährten Aufbau von `BioApps` und `ChemieApps`:
- **Modulare Ordnerstruktur:** Jede Jahrgangsstufe bzw. jeder Lernpfad liegt in einem eigenen, unabhängigen Unterordner (z. B. `SGChemie10/`). Es gibt **keine Root-`package.json` und kein Monorepo**.
- **Flexibler Unterseiten-Aufbau:** Unterordner können entweder als reine statische HTML/CSS/JS-Lernpfade (wie `SGChemie10/` mit `index.html` und den einzelnen Lernbereichs-Seiten `10-2-molekuele.html` usw.) oder als Vite/React-Singlefile-Apps (`vite-plugin-singlefile`) angelegt werden.
- **GitHub Pages & Offline Ready:** Alle Seiten funktionieren sofort auf GitHub Pages sowie lokal per Doppelklick (`file://`).

---

## 2. Directory Structure
```
ChemieLP/
├── index.html                   # Hauptseite: Fachübersicht & Jahrgangsstufen-Portal
├── shared/                      
│   ├── dark-mode.css            # Globale CSS-Overrides für Dark Mode (Chem/Orange Theme)
│   ├── dark-mode.js             # Globales toggleDarkMode() & localStorage-Synchronisation
│   ├── animations.css           # Keyframe-Animationen (fadeIn, slideUp, float)
│   └── tailwind-config.js       # Gemeinsame Tailwind-Konfiguration (Chem-Palette)
├── SGChemie10/                  # Lernpfad Chemie 10 (Sprachliches Gymnasium)
│   ├── index.html               # Startseite Chemie 10 SG (5 Lernbereiche)
│   ├── 10-2-molekuele.html      # Lernbereich 10.2: Moleküle
│   ├── 10-3-wechselwirkungen.html # Lernbereich 10.3: Wechselwirkungen
│   ├── 10-4-protonenuebergaenge.html # Lernbereich 10.4: Protonenübergänge
│   ├── 10-5-redox.html          # Lernbereich 10.5: Redoxreaktionen
│   ├── 10-6-ester.html          # Lernbereich 10.6: Ester und Zucker
│   └── assets/                  # CSS & JS für SGChemie10
├── [Weitere Jahrgangsstufen]/   # z. B. Chemie8/, Chemie9/, NTGChemie10/, Chemie11/, Chemie12/
├── build_all.py                 # Optionales Build-Skript für Vite-basierte Unterordner
└── AI_README.md                 # Diese Datei
```

---

## 3. UI/UX & Design System (Chemie / Orange-Flame Theme)
- **Schriftart:** "Inter" (sans-serif)
- **Farbwelt:** `chem` Farbpalette (`chem-50` bis `chem-950`, kräftiges Labor-Orange & Bernstein)
- **Stil & Illustrationen:** Chemische Motive (Strukturformeln, Benzolringe, Erlenmeyerkolben, Büretten/Laborgeräte, Bunsenbrenner-Flamme/Feuer, Molekülorbitale) als saubere Inline-SVGs
- **Dark Mode:** Gesteuert über `shared/dark-mode.js` (`data-dark-toggle`) und `shared/dark-mode.css`

---

## 4. Hinzufügen einer neuen Jahrgangsstufe / Unterseite
1. Neuen Unterordner `[Ordnername]/` mit einer `index.html` anlegen.
2. In der Root-`index.html` im Array `const projects = [...]` den entsprechenden Eintrag ergänzen bzw. `link` und `subpages` eintragen und `available: true` setzen.
