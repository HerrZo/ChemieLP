# PhET „Interferenz von Quantenwellen“ – Analyse und Konzept für Chemie 12

Stand: 7. November 2026
Simulation: <https://phet.colorado.edu/sims/html/quantum-wave-interference/latest/quantum-wave-interference_all.html?locale=de>

---

## 1. Technischer Aufbau der Seite

### 1.1 Was tatsächlich ausgeliefert wird

Die Seite ist keine gewöhnliche HTML-Seite mit ein paar externen JavaScript-Dateien. Sie ist ein
kompletter PhET-Build:

| Merkmal | Befund |
| --- | --- |
| Sim-Version | 1.0.2, Build vom 31.10.2026 |
| HTML-Größe | ca. 3,45 MB |
| JavaScript | ca. 3,2 MB **inline** in 19 `<script>`-Blöcken |
| Externe Sim-Dateien | keine – das Webpack-Bundle steckt in der HTML-Datei |
| Framework-Stack | PhET Chipper, Joist, Scenery, Axon, Sun, Kite, Sherpa, Tambo, Twixt |
| Sprache | Deutsch über `?locale=de`, Lokalisierung mit Fluent |
| Barrierefreiheit | eigener PDOM-Baum, Screenreader-Beschreibungen, Tastatursteuerung |
| Lizenz Code | GPL-3.0 (laut `packageObject`) |
| Lizenz Inhalt | CC BY-NC 4.0, Namensnennung erforderlich, keine kommerzielle Nutzung |

Der Quellcode des eigentlichen Simulationsmodells ist nicht mehr öffentlich verfügbar. PhET hat die
Einzelrepos in ein nicht öffentliches Monorepo überführt; das GitHub-Repo
`phetsims/quantum-wave-interference` enthält nur noch Dokumentation. Eine zeilenweise Quellcode-Analyse
ist daher nicht möglich. Die folgenden Aussagen stützen sich auf:

- die offiziellen Dokumente `doc/model.md`, `doc/implementation-notes.md` und
  `doc/description-design-doc.md`,
- das Laufzeitverhalten der Seite,
- die im Bundle enthaltenen Klassen-, Meldungs- und Steuerungstexte.

### 1.2 Architektur (aus den offiziellen Implementierungsnotizen)

```text
BaseScreenModel<TScene>                 BaseSceneModel
├── ExperimentModel                     ├── ExperimentSceneModel
└── WaveSolverScreenModel               └── WaveSolverSceneModel
    ├── HighIntensityModel                  ├── HighIntensitySceneModel
    └── SingleParticlesModel                └── SingleParticlesSceneModel
```

- **Experiment** nutzt eine geschlossene Fraunhofer-Formel (`DetectorPattern.ts`): Doppelspalt-Intensität
  innerhalb einer Einzelspalt-Hüllkurve.
- **Hohe Intensität** und **Einzelpartikel** nutzen einen analytischen Wellenlöser (`WaveSolver`,
  `WaveKernel`, `WavePropagation`, `WaveDecoherence`, `WaveMeasurementProjection`).
- Die Darstellung läuft über Scenery/Canvas; die Barrierefreiheit über einen parallelen DOM-Baum.
- Es gibt vier Quellen-Szenen (Photonen, Elektronen, Neutronen, Heliumatome), die ihre Einstellungen
  und Detektordaten beim Umschalten behalten.

### 1.3 Konsequenz für die Nutzung

Die Simulation lässt sich sehr gut **verlinken oder per iframe einbetten**. Kopieren oder Verändern des
Codes ist für eine Schulwebsite nicht nötig und lizenzrechtlich heikel. Eigene Lernseiten sollten mit
eigenen SVG-/Canvas-Darstellungen arbeiten und die Simulation nur einbetten bzw. verlinken.

---

## 2. Feature-Landkarte

### 2.1 Drei Bildschirme

| Bildschirm | Was Schülerinnen und Schüler sehen | Didaktischer Schwerpunkt |
| --- | --- | --- |
| **Experiment** | Draufsicht: Quelle, Doppelspalt, Detektorschirm; Intensitätsmuster oder einzelne Treffer | Zusammenhang zwischen Einstellung und Messmuster; Auswertung mit Lineal und Diagramm |
| **Hohe Intensität** | Zoom in den Wellenbereich; kontinuierliche Wellenfronten, die auf den Spalt treffen | Wie aus Wellen ein Interferenzmuster entsteht; Wellenfeld sichtbar machen |
| **Einzelpartikel** | Einzelne Wellenpakete, ein Treffer pro Teilchen; Auto-Fire möglich | Wahrscheinlichkeit, Messung, Wellenpaket, Aufbau des Musters aus Einzeltreffern |

### 2.2 Vier Quellen

| Quelle | Masse im Modell | Geschwindigkeit | Wellenlänge | Besonderheit |
| --- | --- | --- | --- | --- |
| Photonen | 0 kg | – | 400–700 nm direkt einstellbar | Farbe und Energie sichtbar |
| Elektronen | 9,109 · 10⁻³¹ kg | 2 · 10⁵ – 1 · 10⁶ m/s (Experiment) | über de Broglie | Materiewelle, sehr kleine Wellenlänge |
| Neutronen | 1,675 · 10⁻²⁷ kg | 200–1000 m/s | über de Broglie | größere Masse, langsamere Wellen |
| Heliumatome | 6,646 · 10⁻²⁷ kg | 200–1000 m/s | über de Broglie | „makroskopischer“ Testfall |

### 2.3 Steuerung und Werkzeuge

**Quelle**

- Photonenwellenlänge bzw. Teilchengeschwindigkeit
- Quellintensität bzw. Emissionsrate (0,1–1)
- Ein/Aus-Schalter, bei Einzelpartikeln zusätzlich „Automatikmodus“

**Barriere**

- Konfiguration: beide Spalte offen, linker/rechter Spalt abgedeckt, Detektor an einem/bieden Spalten,
  kein Hindernis
- Spaltabstand (Experiment: 0,05–0,5 mm; Hohe Intensität/Einzelpartikel: 1–5 µm bzw. 0,1–0,6 nm)
- Abstand Hindernis–Schirm (Experiment: 0,4–0,8 m)

**Detektor**

- Darstellung: Schirm oder Diagramm
- Modus: Intensität (glattes Muster) oder Treffer (Histogramm/Einzelpunkte)
- Schirmhelligkeit (nur Darstellung, keine Physik)
- Zoom, Schnappschüsse (bis zu vier pro Quelle), Vergleich
- Lineal, Maßband, Stoppuhr, Zeitdiagramm, Positionsdiagramm
- bei „Einzelpartikel“ ohne Barriere: Messsonde mit Detektorgröße und Trefferwahrscheinlichkeit

**Wellendarstellung**

- Photonen: elektrisches Feld oder Amplitude
- Materieteilchen: Realteil oder Amplitude
- Zeitsteuerung: Pause, Schritt, langsam/normal/schnell

### 2.4 Fachliche Modellierung

| Idee | Umsetzung in der Simulation |
| --- | --- |
| Welle-Teilchen-Dualismus | Quantenzustand als Welle, Detektion als lokaler Treffer |
| Interferenz | kohärente Überlagerung der Amplituden beider Spalte |
| Beugung | Einzelspalt-Hüllkurve um das Interferenzmuster |
| Welcher-Weg-Information | Detektor an einem Spalt zerstört die kohärente Interferenz |
| Wahrscheinlichkeit | Treffer werden aus der berechneten Wahrscheinlichkeitsverteilung gezogen |
| Materiewellen | λ = h / (m · v) |
| Wellenpaket | Gauß-Paket, das sich ausbreitet; ein Treffer pro emittiertem Teilchen |
| Messung | Messsonde projiziert das Paket; erfolgreiche Messung beendet das Paket |

**Wichtige Formeln**

```text
de Broglie:            λ = h / (m · v)
Photonenenergie:       E = h · f = h · c / λ
Doppelspalt:           d · sin θ = n · λ
Streifenabstand:       Δy ≈ λ · L / d        (kleine Winkel)
Einzelspalt:           a · sin θ = n · λ
```

**Idealisierungen und Grenzen**

- kohärente, ideale Quellen; keine Kohärenzlängen, keine Intensitätsverluste
- ideale Spalte und Detektoren; keine Beugung an Spaltkanten oder endliche Detektorauflösung
- Schirmhelligkeit ist reine Anzeige, kein physikalischer Parameter
- „Welcher-Weg“ ist ein idealisiertes Konzept, kein realer Detektoraufbau
- das Modell zeigt **kein** 3D-Orbital und keine Schrödinger-Gleichung; der Orbitalbezug ist eine
  didaktische Brücke, keine Simulation des Wasserstoffatoms

---

## 3. Was die Simulation für Chemie 12 leisten kann

Die Simulation ist fachlich ein Physikangebot. Für den Chemieunterricht ist sie dann stark, wenn sie
folgende Brücken schlägt:

1. **Welle-Teilchen-Dualismus** auch für Elektronen und Atome, nicht nur für Licht.
2. **de-Broglie-Beziehung** quantitativ: Geschwindigkeit ändern, Wellenlänge ablesen, Rechnung prüfen.
3. **Wahrscheinlichkeit statt Bahn**: Der Detektorschirm zeigt, was „Aufenthaltswahrscheinlichkeit“
   bedeutet, bevor der Orbitalbegriff fällt.
4. **Messung und Komplementarität**: Welcher-Weg-Information löscht Interferenz – ein zentrales Motiv
   für das quantenmechanische Atommodell.
5. **Vom Muster zum Orbital**: stehende Wellen, Knoten, Quantisierung und Elektronenwolke lassen sich
   an das Doppelspaltexperiment anschließen.

Nicht geeignet ist die Simulation als Ersatz für:

- die Herleitung der Schrödinger-Gleichung,
- die konkrete Form von s-, p- und d-Orbitalen,
- Spektren und Termschemata,
- quantenchemische Rechenverfahren.

Diese Teile müssen über die Buchseite, eigene Diagramme und Aufgaben ergänzt werden.

---

## 4. Vorschlag: Selbstlernpfad „Vom Doppelspalt zum Orbital“

> **Hinweis zur Umsetzung:** Der hier ursprünglich skizzierte Fünf-Stationen-Vorschlag wurde für die
> 45–60-Minuten-Fassung zu **drei Inhaltsstationen + Hefteintrag + Kompetenzcheck** verdichtet.
> Station 1 verbindet die früheren Ideen 01/02, Station 2 die Ideen 03/04 und Station 3 die Ideen
> 05/06. Der Hefteintrag ist die Synthese: Die Schülerinnen und Schüler formulieren die Inhalte in
> eigenen Worten und vergleichen sie mit Musterantworten. Die folgende ausführliche Skizze bleibt als
> Erweiterungsreservoir erhalten.

### 4.1 Leitfrage

> Warum verhalten sich Elektronen wie Wellen – und was folgt daraus für das Bild vom Atom?

### 4.2 Struktur

| Station | Titel | Kompetenzschwerpunkt | Simulation |
| --- | --- | --- | --- |
| 00 | Überblick und Leitfrage | Vorwissen aktivieren, Lernweg planen | – |
| 01 | Licht: Welle oder Teilchen? | Photon, Energie, Intensität vs. Einzeltreffer | Experiment, Photonen |
| 02 | Materiewellen | λ = h/(m·v), Elektron/Neutron/Helium | Experiment, Materiequellen |
| 03 | Doppelspalt und Beugung | Interferenz, Spaltabstand, Schirmabstand, Messen | Experiment + Hohe Intensität |
| 04 | Einzelpartikel und Messung | Wahrscheinlichkeit, Welcher-Weg, Komplementarität | Einzelpartikel |
| 05 | Vom Doppelspalt zum Orbital | stehende Welle, Knoten, Quantisierung, Orbital | eigene SVG-/Canvas-Modelle |
| 06 | Kompetenzcheck | alle Kompetenzen | – |
| 07 | Glossar | Fachsprache | – |

### 4.3 Konkrete Simulationsaufträge

**Station 01 – Licht**

- Photonen, 650 nm, beide Spalte offen, Modus „Intensität“: Muster beobachten.
- Auf „Treffer“ umschalten: einzelne Punkte erscheinen; Muster wächst mit der Zeit.
- Wellenlänge auf 400 nm und 700 nm ändern: Streifenabstand vergleichen.
- Rechenaufgabe: E = h·c/λ für 650 nm (ca. 1,91 eV) und 400 nm (ca. 3,10 eV).
- Fazit: Licht breitet sich als Welle aus, wird aber als einzelnes Photon detektiert.

**Station 02 – Materiewellen**

- Quelle „Elektronen“, Geschwindigkeit 2·10⁵, 6·10⁵ und 1·10⁶ m/s.
- Wellenlänge im Experiment-Detail ablesen und mit λ = h/(m·v) vergleichen.
- Rechenwerte: 3,64 nm; 1,21 nm; 0,73 nm.
- Heliumatome bei 600 m/s: ca. 0,17 nm; Neutronen bei 600 m/s: ca. 0,66 nm.
- Warum zeigt ein Fußball keine Interferenz? Masse und Geschwindigkeit einsetzen, λ abschätzen.

**Station 03 – Doppelspalt**

- Photonen, 650 nm, Spaltabstand 0,25 mm, Schirmabstand 0,6 m.
- Mit dem Lineal den Abstand benachbarter heller Streifen messen: ca. 1,56 mm.
- Spaltabstand auf 0,5 mm: ca. 0,78 mm; Schirmabstand auf 0,8 m: ca. 2,08 mm.
- Einzelspalt (einen Spalt abdecken): breites Beugungsbild statt scharfer Streifen.
- Rechnung und Messung vergleichen; Abweichungen begründen.

**Station 04 – Einzelpartikel**

- Einzelpartikel, beide Spalte offen, Automatikmodus: Treffer sammeln.
- Nach wenigen Treffern: Zufall; nach vielen: Interferenzmuster.
- Detektoren an beiden Spalten: Muster wird zum Zwei-Band-Muster ohne Interferenz.
- Detektor an einem Spalt: Interferenz verschwindet ebenfalls.
- Messsonde ohne Barriere: Wahrscheinlichkeit in einem Kreisgebiet; erfolgreiche Messung beendet das
  Wellenpaket.
- Fazit: Messung erzeugt Welcher-Weg-Information; Komplementarität von Interferenz und Wegkenntnis.

**Station 05 – Vom Doppelspalt zum Orbital**

- Stehende Welle im Kasten: nur bestimmte Wellenlängen „passen“; Knoten und Bäuche.
- Analogie: Elektron im Atom als stehende Welle; Quantisierung der Energie.
- Übergang zur Wahrscheinlichkeitsdichte: |ψ|²; Orbital als Aufenthaltsraum, nicht als Bahn.
- Buchseite: Orbitaldiagramme, Quantenzahlen, Elektronenkonfiguration.
- Grenze der Analogie explizit machen: Das Doppelspaltexperiment erklärt die Wellennatur, nicht die
  konkrete Form der Orbitale.

### 4.4 Kompetenzerwartungen (Formulierungsvorschlag)

1. Ich kann beschreiben, warum Licht sowohl Wellen- als auch Teilcheneigenschaften zeigt.
2. Ich kann die de-Broglie-Wellenlänge von Elektronen, Neutronen und Atomen berechnen und deuten.
3. Ich kann Interferenz- und Beugungsmuster mit Spaltabstand, Wellenlänge und Schirmabstand erklären.
4. Ich kann Messdaten aus dem Doppelspaltexperiment auswerten und mit der Theorie vergleichen.
5. Ich kann erklären, warum Welcher-Weg-Information die Interferenz zerstört.
6. Ich kann den Zusammenhang zwischen Wellenfunktion, Wahrscheinlichkeitsdichte und Orbitalmodell
   erläutern und die Grenzen der Analogie benennen.

---

## 5. Umsetzung als Lernwebsite

### 5.1 Empfohlene Variante

Eine eigenständige HTML-Lernseite im Stil der bestehenden Chemie-10-Seiten:

- Masthead, Stationssidebar, Fortschrittsanzeige, Kompetenzcheck, Glossar
- Stationen mit Lesetext, Margin-Notes („Merke“, „Fachsprache“, „Typischer Fehler“)
- eingebettete PhET-Simulation per iframe, mit Attributionszeile und Click-to-load
- eigene interaktive Werkzeuge:
  - **Doppelspalt-Labor**: λ, d, L → Δy; Wellenbild, Trefferbild und beides
  - **Einzelteilchen-Sammelbild**: |ψ|², Trefferaufbau, optionaler Welcher-Weg-Detektor
  - **Unbestimmtheits-Rechner**: Δx → Δp_min → Δv_min mit log-log-Diagramm
  - **Orbital-Schnitt**: 1s, 2s, 2p als schematische |ψ|²-Darstellung
- **Hefteintrag-Werkstatt**: sechs aufgabenbasierte Schritte mit Musterantworten, vollständigem
  Musterhefteintrag, Autospeicherung und Druck-/PDF-Ansicht
- Quiztypen wie im bestehenden Projekt: `mc`, `input`, `match`, `order`, `tf`
- Lernstand über `localStorage` (`chem12:q12:v1` und `chem12:q12:heft:v1`)

### 5.2 Wiederverwendung aus Chemie 10

Die Dateien `assets/tokens.css`, `base.css`, `app.css` und `app.js` sind bereits erprobt. Für Chemie 12
wurden sie in einen eigenen Ordner kopiert und um die neue Seite `q12` sowie die Quanten-Terme im
Glossar ergänzt. Das bestehende Quiz- und Fortschrittssystem wird unverändert weiterverwendet.

### 5.3 Lizenz und Attribution

Die Simulation wird nicht kopiert, sondern verlinkt bzw. eingebettet. Empfohlene Attributionszeile:

> Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under
> CC BY-NC 4.0 (https://phet.colorado.edu). Unverändert eingebettet; keine kommerzielle Nutzung.

Eigene Texte, Diagramme und Aufgaben werden wie im Chemie-10-Projekt selbst erstellt.

---

## 6. Stand der Umsetzung

Die Buchseite 3.2.2 liegt vor; die erste Fassung ist umgesetzt:

- `index.html` – Lernpfad mit drei Inhaltsstationen, Hefteintrag, Kompetenzcheck und Glossar
- `README.md` – Öffnen, Aufbau, Didaktik, Rechte
- `LOESUNGEN.md` – Lösungen, Zeitplan und Lehrkrafthinweise
- `assets/quanten-tools.js` – eigene interaktive Modelle
- `assets/hefteintrag.js` – Hefteintrag-Werkstatt mit Autospeicherung, Musterantworten und Druckansicht

Offen bzw. bewusst nicht enthalten:

1. **Curriculare Feinabstimmung** auf Bundesland/Lehrplan und Kursart (Grundkurs/Leistungskurs).
2. **Erweiterung** um die ursprünglich skizzierten fünf Stationen (z. B. Projektwoche).
3. **3D-Orbitale und Spektren** – die Simulation und der Lernpfad zeigen sie nicht; dafür wären eigene
   Modelle oder eine Vertiefungsseite nötig.
4. **Buchabbildungen** – aus Rechtsgründen nicht übernommen; die Seite verweist auf B1–B3 und arbeitet
   mit eigenen Darstellungen.
5. **Messdaten** – die Modelle sind didaktisch, keine Labormessungen.
