
# Besucher Check-In System

Ein digitales Check-In-System für Besucher mit PDF-Dokumentanzeige und -verwaltung.

## Funktionen

- Besucher-Check-In mit persönlichen Informationen
- Anzeige und Akzeptanz von PDF-Dokumenten (Datenschutz, Sicherheitsregeln, etc.)
- Generierung von Check-In-Bestätigungen als PDF
- Automatischer E-Mail-Versand der PDF-Bestätigung nach Check-In
- Admin-Bereich zur Verwaltung von Dokumenten und Einsicht in Check-In-Daten
- Responsive Design für Desktop, Tablet und Mobile

## Technologie-Stack

- React für die Frontend-Implementierung
- Tailwind CSS für das UI-Design
- Shadcn/UI für wiederverwendbare Komponenten
- SQLite für die Datenspeicherung (im Produktionsmodus)
- LocalStorage als Fallback im Browser-Modus
- Docker für die Containerisierung
- Nodemailer für den E-Mail-Versand

## Installation

### Mit Docker (empfohlen)

1. Docker und Docker Compose installieren
2. Repository klonen
3. In das Repository-Verzeichnis wechseln
4. SMTP-Einstellungen in der docker-compose.yml konfigurieren
5. Docker-Container starten:

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

5. Umgebungsvariablen für SMTP konfigurieren
6. Anwendung starten:

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
VITE_ADMIN_USERNAME=meinadmin
VITE_ADMIN_PASSWORD=meinpasswort
```

## E-Mail-Konfiguration

Für den E-Mail-Versand der Check-In-Bestätigungen müssen folgende Umgebungsvariablen konfiguriert werden:

```
VITE_SMTP_HOST=smtp.beispiel.de
VITE_SMTP_PORT=587
VITE_SMTP_USER=benutzer@beispiel.de
VITE_SMTP_PASS=passwort
VITE_SMTP_FROM=absender@beispiel.de
VITE_SMTP_TO=empfaenger@beispiel.de
VITE_SMTP_SUBJECT=Neuer Besucher Check-In
```

## Daten-Persistenz

Im Produktionsmodus (Docker oder `npm run start`) werden die Daten in einer SQLite-Datenbank gespeichert. Die Datenbank wird im Verzeichnis `/app/data` im Container gespeichert und kann über ein Volume persistiert werden.

Bei der Ausführung im Browser (Entwicklungsmodus) werden die Daten im LocalStorage des Browsers gespeichert.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
