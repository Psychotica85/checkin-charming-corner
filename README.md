
# Gäste Check-In System

Ein modernes, digitales Gäste Check-In System für Unternehmen, das es Besuchern ermöglicht, sich anzumelden und Verhaltensregeln zu akzeptieren. Die Daten werden in einer MongoDB-Datenbank gespeichert.

## Projektinfo

**URL**: https://lovable.dev/projects/20474e66-f8a3-41e2-ad41-72ddf7235e8c

## Funktionen

- Digitales Erfassen von Besucherdaten (Name, Unternehmen)
- Digitale Bestätigung der Verhaltensregeln
- Datenschutzkonforme Speicherung in MongoDB
- Responsive Design für alle Geräte
- Modernes und intuitives Benutzerinterface

## Technologien

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Datenbank: MongoDB
- Styling: Tailwind CSS mit shadcn/ui

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

## Backend-Setup (für Produktion)

1. Erstellen Sie eine `.env`-Datei im Hauptverzeichnis mit den folgenden Inhalten:
   ```
   MONGODB_URI=mongodb://username:password@host:port/database
   PORT=5000
   ```

2. Starten Sie den Backend-Server:
   ```sh
   cd src/backend
   node server.js
   ```

## Hinweise

- Für die Produktionsumgebung müssen Sie das Frontend mit `npm run build` kompilieren und das Backend separat hosten.
- Die MongoDB-Verbindung muss für die Produktion konfiguriert werden.
- Stellen Sie sicher, dass Sie die Datenschutzbestimmungen einhalten, wenn Sie personenbezogene Daten speichern.

## Anpassungen

- Logo: Ersetzen Sie das Logo in der `Logo.tsx`-Komponente mit Ihrem eigenen Unternehmenslogo.
- Farben: Passen Sie die Farbpalette in der `tailwind.config.ts`-Datei an Ihr Corporate Design an.
- Verhaltensregeln: Aktualisieren Sie die Verhaltensregeln in der `CheckInForm.tsx`-Komponente.
