
# Digital Check-In System

Eine moderne Webanwendung für Besucher-Check-ins mit Dokumentenverwaltung und automatischer PDF-Berichtgenerierung.

## Features

- Digitaler Check-in für Besucher
- Upload und Akzeptanz von PDF-Dokumenten
- Automatische PDF-Berichtgenerierung für jeden Check-in
- Admin-Portal mit Benutzerverwaltung
- PostgreSQL-Integration für Datenspeicherung
- Responsives Design für alle Geräte

## Umgebungsvariablen

Die Anwendung verwendet folgende Umgebungsvariablen:

| Variable | Beschreibung | Format | Beispiel |
|----------|-------------|--------|---------|
| `DATABASE_URL` | PostgreSQL-Verbindungs-URL | postgresql://[username:password@]host[:port]/database | postgresql://postgres:postgres@localhost:5432/checkin |
| `VITE_SMTP_HOST` | SMTP-Server-Hostname | string | smtp.example.com |
| `VITE_SMTP_PORT` | SMTP-Server-Port | number | 587 |
| `VITE_SMTP_USER` | SMTP-Benutzername | string | user@example.com |
| `VITE_SMTP_PASS` | SMTP-Passwort | string | password123 |
| `VITE_SMTP_FROM` | E-Mail-Absenderadresse | email | noreply@example.com |
| `VITE_SMTP_TO` | E-Mail-Empfängeradresse | email | admin@example.com |

## Installation

1. Repository klonen
2. Dependencies installieren:
```bash
npm install
```
3. Eine `.env`-Datei im Root-Verzeichnis mit den oben aufgelisteten Umgebungsvariablen erstellen
4. Prisma-Datenbank initialisieren:
```bash
npx prisma migrate dev --name init
```
5. Entwicklungsserver starten:
```bash
npm run dev
```

## PostgreSQL Setup

Die Anwendung benötigt PostgreSQL 12 oder höher. Stellen Sie sicher, dass:

1. Sie eine PostgreSQL-Datenbank mit dem Namen 'checkin' erstellen (oder Ihrem bevorzugten Namen)
2. Sie die `DATABASE_URL`-Umgebungsvariable auf Ihre PostgreSQL-Instanz setzen
3. Die Anwendung erstellt automatisch die erforderlichen Tabellen beim ersten Start:
   - `Document` - Speichert PDF-Dokumente für Besucher zum Akzeptieren
   - `CheckIn` - Speichert Besucher-Check-in-Daten
   - `User` - Speichert Admin-Benutzerkonten

## Standard-Login

Das System erstellt beim ersten Start einen Standard-Admin-Benutzer:
- **Benutzername:** admin
- **Passwort:** admin

*Wichtig: Ändern Sie dieses Passwort sofort nach dem ersten Login.*

## Deployment

Für das Produktions-Deployment:

1. Anwendung bauen:
```bash
npm run build
```
2. Den Build-Ordner auf Ihren Webserver deployen
3. Stellen Sie sicher, dass alle erforderlichen Umgebungsvariablen in Ihrer Produktionsumgebung gesetzt sind

## Docker-Deployment

Die Anwendung kann einfach mit Docker und Docker Compose deployed werden:

```bash
docker-compose up -d
```

Dies wird die Anwendung und eine PostgreSQL-Datenbank starten. Die Anwendung ist dann unter http://localhost:8080 verfügbar.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
