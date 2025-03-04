
FROM node:18-alpine

# Arbeitssverzeichnis setzen
WORKDIR /app

# Pakete für better-sqlite3 und andere Abhängigkeiten installieren
RUN apk add --no-cache python3 make g++ ca-certificates sqlite

# Diagnose-Tools für Fehlerbehebung hinzufügen
RUN apk add --no-cache curl procps busybox-extras

# Paketdateien kopieren und Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Projektdateien kopieren
COPY . .

# Shell-Skript mit korrekten Zeilenumbrüchen erstellen und Berechtigungen setzen
RUN chmod +x start.sh
RUN sed -i 's/\r$//' start.sh

# Anwendung bauen
RUN npm run build

# Verzeichnis für SQLite-Datenbank erstellen mit richtigen Berechtigungen
RUN mkdir -p /app/data
RUN chmod -R 777 /app/data
RUN echo "Test" > /app/data/create_test.txt

# Umgebungsvariablen setzen
ENV NODE_ENV=production
ENV PORT=3000

# SMTP-Konfiguration (standardmäßig leer, wird in docker-compose.yml überschrieben)
ENV VITE_SMTP_HOST=""
ENV VITE_SMTP_PORT="587"
ENV VITE_SMTP_USER=""
ENV VITE_SMTP_PASS=""
ENV VITE_SMTP_FROM=""
ENV VITE_SMTP_TO=""
ENV VITE_SMTP_SUBJECT="Neuer Besucher Check-In"

# Standard-Anmeldedaten für Admin-Bereich
ENV VITE_ADMIN_USERNAME=admin
ENV VITE_ADMIN_PASSWORD=admin

# Port freigeben
EXPOSE 3000

# Anwendung über das Shell-Skript starten
CMD ["/bin/sh", "start.sh"]
