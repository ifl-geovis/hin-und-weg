## Kurzanleitung

-   \*.png (EPSG:3857) Datei erstellen und im Ordner offline speichern
-   Extent (EPSG:3857) des Bildes ermitteln
-   Label, Dateipfad und Extent in Konfigurationsdatei eintragen

## Ausführliche Anleitung

-   Ordner für die Bilddateien und die Konfigurationsdatei erstellen
    -   Konfigurationsdatei (*.txt) erstellen
-   Offlinekarten erstellen
    -   Koordinatensystem EPSG:3857 verwenden
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
-   Ausdehnung West
-   Ausdehnung Süd
-   Ausdehnung Ost
-   Ausdehnung Nord

bspw:
Potsdam,potsdam.png,1431295.12,6855898.52,1491858.23,6889632.89

## Eigene Karten in die Anwendung importieren
In den Einstellungen in der Anwendung kann ein eigener Ordner mit Offlinekarten ausgewählt werden. Dafür muss ein Ordner mit den Offlinekarten sowie einer Konfigurationsdatei vorhanden sein. Um die Karten in die Anwendung zu importieren, muss in den Einstellungen die Konfigurationsdatei ausgewählt werden.

## Standardpfad für die integrierten Offline-Karten
* Windows: ..\hin-und-weg-win32-x64\resources\app\offline
* Linux: ..\hin-und-weg-linux-x64\resources\app\offline
* MacOS: ..\hin-und-weg-darwin-x64\hin-und-weg.app\Contents\Resources\app\offline
<span style="font-size: 14px;">Um die Ordner unter hin-und-weg.app anzuzeigen, müssen mittels <kbd>ctrl</kbd> + linker Maustaste die Paketinhalte
angezeigt werden.</span>
