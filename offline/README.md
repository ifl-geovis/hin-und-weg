# Wie können Offline-Karten hinzugefügt werden?

## Kurzanleitung

-   \*.png Datei erstellen
-   Extent des Bildes in EPSG:4326 ermitteln
-   Label, Dateipfad und Extent in offlineMaps.txt eintragen

## Ausführliche Anleitung

-   Für die gewünschte Hintergrundkarte einen Geodienst finden
-   Geodienst (WMS/WMTS) in QGIS einladen
-   Auf die gewünschte Ausdehnung navigieren / zoomen
-   Karten als Bild exportieren
    -   Projekt > Import/Export > Karte als Bild speichern
        -   Auflösung erhöhen (bspw. 300 dpi)
        -   Extent notieren _bzw. gleich in die offlineMaps.txt eintragen_
        -   Worlddatei muss nicht erstellt werden
-   Bilddatei (\*.png oder \*.jpeg) in den Ordner _offline_ speichern
-   Informationen in die _offlineMaps.txt_ eintragen

## Aufbau der offlineMaps.txt

Die offlineMaps.txt enthält alle relevanten Informationen für die Nutzung von Offline-Karten, die von der Anwendung eingelesen und verarbeitet werden.

Die Reihenfolge in der Dropdown-Liste in der Anwendung entspricht dier Reihenfolge in der offlineMaps.txt.

Folgende Informationen werden Komma-separiert benötigt:

-   Label zur Anzeige in der Anwendung
-   Dateiname
-   Ausdehnung Nord (EPSG:4326)
-   Ausdehnung West (EPSG:4326)
-   Ausdehnung Süd (EPSG:4326)
-   Ausdehnung Ost (EPSG:4326)

bspw:
Potsdam,potsdam.png,52.3627883,12.9794247,52.4269553,13.1674247
