## Kurzanleitung

-   \*.png Datei erstellen und im Ordner offline speichern
-   Extent des Bildes in EPSG:4326 ermitteln
-   Label, Dateipfad und Extent in Konfigurationsdatei eintragen

## Ausführliche Anleitung

-   Ordner für die Bilddateien und die Konfigurationsdatei erstellen
    -   Konfigurationsdatei (*.txt) erstellen
-   Offlinekarten erstellen
    -   Für die gewünschte Hintergrundkarte einen Geodienst finden
    -   Geodienst (WMS/WMTS) in QGIS einladen
    -   Auf die gewünschte Ausdehnung navigieren / zoomen
    -   Karten als Bild exportieren
        -   Projekt > Import/Export > Karte als Bild speichern
            -   Auflösung erhöhen (bspw. 300 dpi)
            -   Extent in die offlineMaps.txt eintragen
            -   Worlddatei muss nicht erstellt werden
    -   Bilddatei (\*.png oder \*.jpeg) in Ordner speichern
-   Informationen über den angezeigten Namen und die Datei in die Konfigurationsdatei eintragen

## Aufbau der Konfigurationsdatei

Die Konfigurationsdatei enthält alle relevanten Informationen für die Nutzung von Offline-Karten, die von der Anwendung eingelesen und verarbeitet werden. Die Reihenfolge in der Dropdown-Liste in der Anwendung entspricht der Reihenfolge in der Konfigurationsdatei. Folgende Informationen werden Komma-separiert benötigt:

-   Label zur Anzeige in der Anwendung
-   Dateiname
-   Ausdehnung Süd (EPSG:4326)
-   Ausdehnung West (EPSG:4326)
-   Ausdehnung Nord (EPSG:4326)
-   Ausdehnung Ost (EPSG:4326)

bspw:
Potsdam,potsdam.png,52.3627883,12.9794247,52.4269553,13.1674247

## Eigene Karten in die Anwendung importieren
In den Einstellungen in der Anwendung kann ein eigener Ordner mit Offlinekarten ausgewählt werden. Dafür muss ein Ordner mit den Offlinekarten sowie einer Konfigurationsdatei vorhanden sein. Um die Karten in die Anwendung zu importieren, muss in den Einstellungen die Konfigurationsdatei ausgewählt werden.