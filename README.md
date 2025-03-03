
# Gäste Check-In System

Ein modernes, digitales Gäste Check-In System für Unternehmen, das es Besuchern ermöglicht, sich anzumelden und Verhaltensregeln zu akzeptieren. Die Daten werden in einer MongoDB-Datenbank gespeichert.

## Projektinfo

**URL**: https://lovable.dev/projects/20474e66-f8a3-41e2-ad41-72ddf7235e8c

## Funktionen

- Digitales Erfassen von Besucherdaten (Name, Unternehmen)
- Digitale Bestätigung der Verhaltensregeln und wichtiger Dokumente
- Automatische Generierung von PDF-Bestätigungen
- Datenschutzkonforme Speicherung in MongoDB
- Admin-Bereich für Dokumentenverwaltung und Benutzeradministration
- Responsive Design für alle Geräte
- Modernes und intuitives Benutzerinterface

## Technologien

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Datenbank: MongoDB
- Styling: Tailwind CSS mit shadcn/ui
- PDF-Generierung: jspdf

## Installation und Start

```sh
# Schritt 1: Repository klonen
git clone <REPOSITORY_URL>

# Schritt 2: In das Projektverzeichnis wechseln
cd <PROJEKT_NAME>

# Schritt 3: Abhängigkeiten installieren
npm i

# Schritt 4: Frontend-Entwicklungsserver starten
npm run dev
```

## Umgebungsvariablen

Für die Produktionsumgebung müssen die folgenden Umgebungsvariablen in einer `.env`-Datei im Hauptverzeichnis konfiguriert werden:

```
# Datenbank-Konfiguration
MONGODB_URI=mongodb://username:password@host:port/database

# Server-Konfiguration
PORT=5000
HOST=localhost

# E-Mail-Konfiguration (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
MAIL_FROM=noreply@example.com

# Sicherheits-Konfiguration
JWT_SECRET=your_secure_jwt_secret_key
SESSION_SECRET=your_secure_session_secret_key

# Anwendungs-Konfiguration
COMPANY_NAME=Ihr Unternehmen
COMPANY_LOGO_URL=/path/to/logo.png
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sichere_passwort_fuer_ersteinrichtung
BASE_URL=https://your-app-domain.com
```

## Backend-Setup (für Produktion)

1. Stellen Sie sicher, dass Sie die `.env`-Datei mit den notwendigen Umgebungsvariablen konfiguriert haben.

2. Starten Sie den Backend-Server:
   ```sh
   cd src/backend
   node server.js
   ```

## Hinweise

- Für die Produktionsumgebung müssen Sie das Frontend mit `npm run build` kompilieren und das Backend separat hosten.
- Die MongoDB-Verbindung muss für die Produktion konfiguriert werden.
- Stellen Sie sicher, dass Sie die Datenschutzbestimmungen einhalten, wenn Sie personenbezogene Daten speichern.
- Der Admin-Bereich ist unter der Route `/admin` erreichbar.

## Anpassungen

- Logo: Ersetzen Sie das Logo in der `Logo.tsx`-Komponente mit Ihrem eigenen Unternehmenslogo.
- Farben: Passen Sie die Farbpalette in der `tailwind.config.ts`-Datei an Ihr Corporate Design an.
- Dokumente: Laden Sie über den Admin-Bereich alle relevanten Dokumente hoch, die Besucher bestätigen müssen.
- Text: Passen Sie die Texte und Beschreibungen in den entsprechenden Komponenten an Ihre Bedürfnisse an.
