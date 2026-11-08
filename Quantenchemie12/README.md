# Quantenchemie 12: Von Wellen und Teilchen

Interaktiver Selbstlernpfad für die Oberstufe (ca. 60–75 Minuten inklusive Hefteintrag) auf Grundlage
der Buchseite **3.2.2 „Von Wellen und Teilchen“**. Der Pfad verbindet die physikalischen Grundlagen –
Welle-Teilchen-Dualismus, Wellenfunktion, Born-Regel und Heisenbergsche Unbestimmtheit – mit dem
Orbitalmodell der Chemie. Der Hefteintrag kann auch als Hausaufgabe bearbeitet werden; dann bleiben
für den Unterricht ca. 45–60 Minuten.

## Öffnen

1. **Lokal:** `index.html` doppelklicken. Die Seite funktioniert ohne Server; JavaScript muss erlaubt sein.
2. **Schulserver / GitHub Pages:** Den gesamten Ordner `Quantenchemie12` hochladen, nicht nur die HTML-Datei.
   Es gibt keinen Build-Schritt und keine Serverlogik.
3. **PhET-Simulation:** Sie wird erst nach Klick auf „Simulation laden“ von PhET geladen. Vorher entsteht
   keine Verbindung zu PhET. Alternativ lässt sich die Simulation in einem neuen Tab öffnen.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Lernpfad mit drei Inhaltsstationen, Hefteintrag, Kompetenzcheck und Glossar |
| `assets/tokens.css` | Farben, Typografie, Abstände (Hallmark-/Newsprint-System) |
| `assets/base.css` | Grundregeln und Reset |
| `assets/app.css` | Layout, Stationen, Quiz, Glossar, Dialoge |
| `assets/app.js` | Navigation, Fortschritt, Quiz-Engine, Glossar, Tooltips |
| `assets/quanten-tools.js` | Drei eigene interaktive Modelle und die PhET-Einbettung |
| `assets/hefteintrag.js` | Hefteintrag-Werkstatt: Autospeicherung, Musterantworten, Druckansicht |
| `ANALYSE-und-KONZEPT.md` | Code-/Feature-Analyse der PhET-Simulation und didaktisches Konzept |
| `LOESUNGEN.md` | Lösungen, Rechenwege, Zeitplan und Lehrkrafthinweise |

## Aufbau

| Station | Inhalt | Kompetenzen |
| --- | --- | --- |
| 00 Überblick | Leitfrage, Kompetenzen, Arbeitsweise | – |
| 01 Welle oder Teilchen? | Young, Photoeffekt, Jönsson, de Broglie, Doppelspalt-Labor, PhET Experiment | K1, K2 |
| 02 Wellenfunktion und Wahrscheinlichkeit | Born-Regel, \|ψ\|², Einzelteilchen-Sammelbild, PhET Einzelpartikel | K3, K4 |
| 03 Unbestimmtheit und Atommodell | Heisenberg, Orbital als Wahrscheinlichkeitsraum, Unbestimmtheits-Rechner und Orbital-Schnitt | K5, K6 |
| 04 Hefteintrag | sechs aufgabenbasierte Schritte, Musterantworten, vollständiger Musterhefteintrag, Druckansicht | K1–K6 |
| 05 Kompetenzcheck | sechs Aufgaben, eine pro Kompetenz | K1–K6 |
| 06 Glossar | 17 zentrale Begriffe mit Suche | – |

Der Fortschritt zählt **Kompetenzen**, nicht Stationen. Sowohl der Hefteintrag als auch der
Kompetenzcheck schließen alle Kompetenzen ab; das entspricht dem Muster der Chemie-10-Lernseiten.
Der Hefteintrag ist als Synthese gedacht: Die Schülerinnen und Schüler formulieren die Inhalte der
drei Stationen in eigenen Worten und vergleichen sie anschließend mit den Musterantworten.

## Didaktische Hinweise

- **Roter Faden:** Die Buchseite liefert die physikalischen Befunde. Station 1 zeigt die Wellen- und
  Teilchenseite, Station 2 macht aus dem Wellenbild eine Wahrscheinlichkeitsaussage, Station 3 zieht
  die Konsequenz für das Atommodell.
- **Buchseite A1:** Der Fußball-Vergleich wird rechnerisch aufgegriffen. Die de-Broglie-Wellenlänge ist
  so klein, dass keine messbare Interferenz auftritt. Das ist eine Grenzfallbetrachtung, kein Beweis,
  dass makroskopische Körper „keine“ Wellenfunktion haben.
- **Buchseite A2:** Die Unbestimmtheitsrelation wird als Grund dafür gelesen, dass feste Kreisbahnen
  durch Orbitale als Wahrscheinlichkeitsräume ersetzt werden.
- **Hefteintrag:** Sechs Schritte von der Definition über die Formeln bis zum Fazit. Die Schülerinnen
  und Schüler schreiben zuerst selbst, vergleichen dann mit der Musterantwort und überarbeiten ihren
  Text. Die „Kernbegriffe“ unter jeder Aufgabe sind eine Checkliste; die Wortzahl zeigt den Umfang.
  Der vollständige Musterhefteintrag ist als Vergleichs- und Druckvorlage hinterlegt.
- **Typische Fehlvorstellungen:** Die Wellenfunktion ist keine „verschmierte Materie“; ein einzelnes
  Elektron zeigt noch kein vollständiges Muster; die Unbestimmtheit ist keine bloße Messungenauigkeit;
  das Orbital ist keine Bahn.
- **Messung und Welcher-Weg:** Das Einzelteilchen-Modell enthält einen optionalen Welcher-Weg-Detektor.
  Er ist eine Vertiefung zur Komplementarität und nicht zwingend für den Kernpfad.
- **Grenzen der Modelle:** Die Orbitaldarstellung ist ein schematischer Schnitt durch \|ψ\|², keine
  maßstabsgetreue Lösung der Schrödinger-Gleichung. Die Simulation zeigt keine 3D-Orbitale und keine
  Spektren.

## Aufgaben und Lösungen bearbeiten

Die Quizdaten stehen als JSON direkt bei der jeweiligen Station:

```html
<script type="application/json" data-quiz-data="welle">
{
  "questions": [
    {
      "id": "q1",
      "type": "mc",
      "level": "II",
      "competency": "K1",
      "prompt": "…",
      "options": ["…", "…"],
      "correct": 0,
      "explain": "…"
    }
  ]
}
</script>
```

Unterstützte Typen: `mc`, `multi`, `tf`, `input`, `match`, `order`. Die Engine steht in `assets/app.js`.
Die Kompetenzzuordnung der Stationen steht oben in `CHAPTER_COMPETENCIES` unter `q12`.

Die Aufgaben, Musterantworten und der Musterhefteintrag stehen direkt im HTML der Station
`#hefteintrag`. Die Autospeicherung, die Muster-Toggles und die Druckansicht stehen in
`assets/hefteintrag.js`.

## Lernstand

Der Fortschritt und der Hefteintrag werden lokal im Browser gespeichert:

```text
chem12:q12:v1        Fortschritt, Quiz, Kompetenzcheck
chem12:q12:heft:v1   selbst formulierte Hefteintrag-Texte
```

Es gibt kein Konto und keine Übertragung an einen Server. „Lernstand zurücksetzen“ löscht beide
Einträge. Der Hefteintrag hat zusätzlich einen eigenen Reset-Knopf; er löscht nur die selbst
formulierten Texte, nicht den übrigen Lernstand.

## Hefteintrag drucken

Im Hefteintrag gibt es zwei Druckwege:

- **Meinen Hefteintrag drucken** – druckt die selbst formulierten Texte mit Überschriften, Name-und-
  Datum-Zeile und Platz für leere Schritte. Über den Browser-Druckdialog lässt sich daraus ein PDF
  speichern.
- **Musterhefteintrag drucken** – druckt den vollständigen Musterhefteintrag inklusive Formeln und
  Skizze.

Die Druckansicht wird erst beim Klick aufgebaut und ist im normalen Bildschirmlayout ausgeblendet.

## Quellen und Rechte

- **Buchseite:** 3.2.2 „Von Wellen und Teilchen“ (zur Verfügung gestellt von der Lehrkraft). Die Seite
  dient als fachliche Orientierung. Es werden **keine Abbildungen aus dem Buch** übernommen.
- **PhET-Simulation:** „Interferenz von Quantenwellen“, PhET Interactive Simulations, University of
  Colorado Boulder, <https://phet.colorado.edu>. Inhalt lizenziert unter **CC BY-NC 4.0**; der Code
  steht unter **GPL-3.0**. Die Simulation wird unverändert eingebettet bzw. verlinkt, nicht kopiert.
  Keine kommerzielle Nutzung.
- **Eigene Grafiken und Modelle:** Alle Diagramme, Canvas-Modelle und Texte dieser Lernseite sind eigene
  Darstellungen. Sie dürfen im schulischen Rahmen verwendet und angepasst werden.
- **Schriftarten:** Zilla Slab, Spectral und Libre Franklin über Google Fonts. Ohne Internet greifen
  Ersatzschriften; die Seite bleibt lesbar.

## Technische Hinweise

- Getestet in Chromium/Chrome. Canvas, `dialog`, `IntersectionObserver` und `localStorage` werden
  vorausgesetzt.
- `prefers-reduced-motion` wird berücksichtigt: Animationen laufen dann nicht automatisch.
- Die PhET-Simulation läuft in einem iframe mit fester Höhe (560 px, mobil 420 px). Auf sehr kleinen
  Geräten ist der Link „In neuem Tab öffnen“ die bessere Wahl.
- Die Seite selbst setzt keine Cookies und kein Tracking ein. Google Fonts wird extern geladen; ohne
  Internet greifen Ersatzschriften. PhET selbst kann nach dem Laden eigene Statistik-/Analyseverbindungen
  aufbauen; deshalb ist die Einbettung click-to-load.
