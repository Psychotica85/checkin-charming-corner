
# Besucher Check-In System

Ein modernes System zur Verwaltung von Besucher Check-Ins mit PDF-Dokumentenverwaltung und E-Mail-Versand.

## Features

- Besucher Check-In mit Erfassung persönlicher Daten
- Automatische PDF-Generierung für Check-In-Bestätigungen
- Verwaltung von Unternehmenseinstellungen und Logo
- Dokumentenverwaltung für Besucherrichtlinien und andere Dokumente
- Admin-Bereich mit Übersicht aller Check-Ins
- Automatischer E-Mail-Versand nach Check-In
- Vollständig containerisierte Anwendung mit Docker
- MySQL-Datenbank in separatem Container für bessere Datenpersistenz

## Technologien

- Frontend: React, TypeScript, Tailwind CSS, Shadcn UI
- Backend: Node.js, Express
- Datenbank: MySQL 8 in separatem Container
- Containerisierung: Docker, Docker Compose
- PDF-Generierung: jsPDF
- E-Mail-Versand: Nodemailer

## Voraussetzungen

- Docker und Docker Compose
- Git

## Installation und Start

1. Repository klonen:
   ```
   git clone https://github.com/username/besuchercheck-in.git
   cd besuchercheck-in
   ```

2. Umgebungsvariablen in der `docker-compose.yml`-Datei anpassen (optional):
   - SMTP-Konfiguration für E-Mail-Versand
   - Admin-Zugangsdaten
   - Datenbank-Zugangsdaten

3. Anwendung starten:
   ```
   docker-compose up -d
   ```

4. Die Anwendung ist nun unter http://localhost:3000 verfügbar.

## Konfiguration

### SMTP für E-Mail-Versand

Für den E-Mail-Versand müssen folgende Umgebungsvariablen in der `docker-compose.yml` konfiguriert werden:

```yaml
- VITE_SMTP_HOST=smtp.example.com
- VITE_SMTP_PORT=587
- VITE_SMTP_USER=user@example.com
- VITE_SMTP_PASS=yourpassword
- VITE_SMTP_FROM=noreply@example.com
- VITE_SMTP_TO=recipient@example.com
- VITE_SMTP_SUBJECT="Neuer Besucher Check-In"
```

### Admin-Zugangsdaten

Die Standard-Zugangsdaten für den Admin-Bereich können in der `docker-compose.yml` angepasst werden:

```yaml
- VITE_ADMIN_USERNAME=admin
- VITE_ADMIN_PASSWORD=admin
```

### Datenbankverbindung

Die Datenbankverbindung wird automatisch hergestellt. Die Konfiguration kann in der `docker-compose.yml` angepasst werden:

```yaml
- DB_HOST=mysql
- DB_PORT=3306
- DB_USER=checkin
- DB_PASSWORD=checkin
- DB_NAME=checkin_db
```

## Architektur

Das System besteht aus zwei Docker-Containern:
1. **App-Container**: Enthält die React-Frontend- und Node.js-Backend-Anwendung
2. **MySQL-Container**: Enthält die MySQL-Datenbank für die Datenpersistenz

Die Container sind über das Docker-Netzwerk miteinander verbunden und kommunizieren über den Hostnamen `mysql`.

## Datenpersistenz

Die MySQL-Datenbank verwendet ein Docker-Volume, um Daten dauerhaft zu speichern:

```yaml
volumes:
  mysql_data:
```

## GitHub-Workflows

Das Projekt enthält einen GitHub-Workflow für automatisierte Docker-Builds. Um Docker-Images zu pushen, müssen in den GitHub-Repository-Einstellungen folgende Secrets konfiguriert werden:

- `DOCKERHUB_USERNAME`: Ihr DockerHub-Benutzername
- `DOCKERHUB_TOKEN`: Ihr DockerHub-Access-Token

## Lizenz

[MIT](LICENSE)
