
# Check-In System

Ein einfaches Check-In-System für Besucher mit PDF-Dokumentanzeige und -verwaltung.

## Funktionen

- Besucher-Check-In mit persönlichen Informationen
- Anzeige und Akzeptanz von PDF-Dokumenten (Datenschutz, Sicherheitsregeln, etc.)
- Generierung von Check-In-Bestätigungen als PDF
- Admin-Bereich zur Verwaltung von Dokumenten und Einsicht in Check-In-Daten
- Responsive Design für Desktop, Tablet und Mobile

## Technologie-Stack

- React für die Frontend-Implementierung
- Tailwind CSS für das UI-Design
- Shadcn/UI für wiederverwendbare Komponenten
- SQLite für die Datenspeicherung (im Produktionsmodus)
- LocalStorage als Fallback im Browser-Modus
- Docker für die Containerisierung

## Installation

### Mit Docker (empfohlen)

1. Docker und Docker Compose installieren
2. Repository klonen
3. In das Repository-Verzeichnis wechseln
4. Docker-Container starten:

```bash
docker-compose up -d
```

Die Anwendung ist dann unter http://localhost:3000 erreichbar.

### Manuelle Installation

1. Node.js (v16+) installieren
2. Repository klonen
3. In das Repository-Verzeichnis wechseln
4. Dependencies installieren:

```bash
npm install
```

5. Anwendung starten:

```bash
npm run build
npm run start
```

Die Anwendung ist dann unter http://localhost:3000 erreichbar.

## Admin-Zugang

Der standardmäßige Admin-Zugang ist:

- Benutzername: admin
- Passwort: admin

Diese Zugangsdaten können über Umgebungsvariablen angepasst werden:

```
ADMIN_USERNAME=meinadmin
ADMIN_PASSWORD=meinpasswort
```

## Daten-Persistenz

Im Produktionsmodus (Docker oder `npm run start`) werden die Daten in einer SQLite-Datenbank gespeichert. Die Datenbank wird im Verzeichnis `/app/data` im Container gespeichert und kann über ein Volume persistiert werden.

Bei der Ausführung im Browser (Entwicklungsmodus) werden die Daten im LocalStorage des Browsers gespeichert.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
