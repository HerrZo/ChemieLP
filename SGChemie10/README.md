# Chemie 10: Interaktive Lernwebsites

Fünf Lernpfade für die Jahrgangsstufe 10 am sprachlichen Gymnasium, abgestimmt auf den LehrplanPLUS Chemie 10 (HG, SG, MuG, WWG, SWG) und das Material im Ordner `SGC10D_2526`.

## Dateien

| Datei | Lernbereich | Inhalt |
| --- | --- | --- |
| `index.html` | Startseite | Überblick, Kapitelindex, Lernstand, Arbeitsweise |
| `10-2-molekuele.html` | 10.2 Moleküle | Orbitalmodell, Valenzstrich, Mesomerie, EPA, Isomerie, Nomenklatur |
| `10-3-wechselwirkungen.html` | 10.3 Wechselwirkungen | Elektronegativität, Molekülpolarität, Wasserstoffbrücken, Stoffklassen, Löslichkeit |
| `10-4-protonenuebergaenge.html` | 10.4 Protonenübergänge | pH-Wert, Brønsted, Säurestärke, Konzentration, Neutralisation, Titration |
| `10-5-redox.html` | 10.5 Redoxreaktionen | Oxidationszahlen, Redoxgleichungen, Alkohole, Nachweise, Brennstoffzelle |
| `10-6-ester.html` | 10.6 Ester und Zucker | Zucker, Veresterung, Hydrolyse, Fette, Mechanismus, Alltag |

Jedes Kapitel hat fünf Inhaltsstationen und einen Kompetenzcheck. Dazu kommen eine Überblicksseite und ein Glossar. Die Kapitel enthalten 34 Kompetenzerwartungen aus dem Lehrplan, verteilt auf 6, 6, 10, 7 und 5 Kompetenzen. Der Fortschritt zählt **Kompetenzen**, nicht Stationen: 10.4 zeigt also 0/10, 10.5 0/7 und 10.6 0/5. Eine Station kann mehrere Kompetenzen abdecken; der Kompetenzcheck am Kapitelende schließt alle Kompetenzen ab.

## Öffnen und veröffentlichen

1. **Lokal öffnen:** `index.html` doppelklicken. Die Seiten funktionieren ohne Server. Für die interaktiven Teile muss JavaScript erlaubt sein.
2. **GitHub Pages:** Den gesamten Ordner `Lernwebsites` in ein Repository legen und in den Einstellungen unter „Pages“ den Ordner als Quelle wählen. Die Startseite ist `index.html`. Immer den ganzen Ordner mit `assets/` hochladen, nicht nur einzelne HTML-Dateien.
3. **Schulserver oder Moodle:** Den Ordner unverändert hochladen. Es gibt keinen Build-Schritt und keine Serverlogik.

Die Schriften werden über Google Fonts geladen. Ohne Internet greifen die Ersatzschriften; die Seiten bleiben lesbar. Wer die Seiten vollständig offline betreiben will, kann die Schriftdateien lokal ablegen und die `<link>`-Verweise in den HTML-Dateien ersetzen.

## Lernstand

Der Fortschritt wird lokal im Browser gespeichert (`localStorage`). Es gibt kein Konto und keine Übertragung an einen Server. Der Lernstand bleibt auf dem jeweiligen Gerät und im jeweiligen Browser. Über „Lernstand zurücksetzen“ in der Seitenleiste lässt sich alles löschen.

Gespeicherte Schlüssel:

- `chem10:lb2:v1`
- `chem10:lb3:v1`
- `chem10:lb4:v1`
- `chem10:lb5:v1`
- `chem10:lb6:v1`

## Aufgaben und Lösungen bearbeiten

Die Quizdaten stehen als JSON in den HTML-Dateien, direkt bei der jeweiligen Station:

```html
<script type="application/json" data-quiz-data="orbital">
{
  "questions": [
    {
      "id": "q1",
      "type": "mc",
      "prompt": "…",
      "options": ["…", "…"],
      "correct": 0,
      "explain": "…"
    }
  ]
}
</script>
```

Unterstützte Aufgabentypen:

- `mc`: eine richtige Antwort, `correct` ist der Index.
- `multi`: mehrere richtige Antworten, `correct` ist eine Liste von Indizes.
- `tf`: wahr oder falsch, `correct` ist ein Wahrheitswert.
- `input`: Texteingabe, `accept` enthält die akzeptierten Schreibweisen, `model` die Musterlösung.
- `match`: Zuordnung, `left`, `right` und `correct` (Index je linkem Eintrag).
- `order`: Reihenfolge, `items` in der richtigen Reihenfolge, optional `start` als Startreihenfolge.

Die Werkzeugdaten stehen in eigenen JSON-Blöcken mit `data-tool-data`. Die Darstellung übernimmt `assets/tools.js`. Die Quiz- und Fortschrittslogik steht in `assets/app.js`, das Design in `assets/tokens.css`, `base.css` und `app.css`.

## Tooltips und Glossar

Fachbegriffe in den Lernstationen und auf den Überblicksseiten sind mit einer gepunkteten Unterlinie markiert. Beim Darüberfahren oder Fokussieren erscheint eine kurze Erklärung. Pro Kapitel werden bis zu acht Begriffe in den Stationen und bis zu sechs weitere auf der Überblicksseite automatisch hervorgehoben; die übrigen stehen weiterhin im Glossar. Die Tooltips sind auch per Tastatur erreichbar (Tab) und verschwinden beim Verlassen des Begriffs.

## Quellen und Daten

- Kompetenzerwartungen und Inhalte: LehrplanPLUS Chemie 10 für das sprachliche Gymnasium, [Fachlehrplan](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch).
- Unterrichtsmaterial: Ordner `SGC10D_2526` (Präsentationen, Arbeitsblätter, Aufgaben).
- Siedetemperaturen, Elektronegativitäten und pKa-Werte sind gerundete Literaturwerte. Sie dienen der Veranschaulichung, nicht als Messdaten.
- Die pH- und Titrationsmodelle gelten für starke Säuren und Basen. Sie sind didaktische Modelle, keine Laboranleitung.

## Grafik und Rechte

Alle Diagramme, Molekülskizzen und Werkzeuge sind eigene SVG-Zeichnungen. Es werden keine Abbildungen aus Schulbüchern oder aus dem hochgeladenen Material übernommen. Das ist bewusst so gewählt, damit die Seiten öffentlich auf GitHub Pages stehen können.

## Bewusste Grenzen

- Kein Login, keine Lehrkraft-Auswertung und keine zentrale Speicherung.
- Kein echter Reaktionsmechanismus-Editor; die Mechanismus-Schritte sind als lesbare Schrittfolge dargestellt.
- Keine echten Messdaten und keine Titrationskurve; der Schwerpunkt liegt auf dem Äquivalenzpunkt und der Rechnung.
- Die Seiten sind für Selbstlernen zu Hause angelegt. Für den Einsatz im Unterricht können einzelne Stationen projiziert werden; die Modelle sind dann auch ohne Schülerkonto sichtbar.
