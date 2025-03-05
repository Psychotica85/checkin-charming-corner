FROM node:18-alpine AS builder

# Arbeitssverzeichnis setzen
WORKDIR /app

# Pakete für MySQL-Client und andere Abhängigkeiten installieren
RUN apk add --no-cache python3 make g++ ca-certificates curl

# Paketdateien kopieren und alle Abhängigkeiten für den Build installieren
COPY package*.json ./
# Verwende --verbose und --no-audit, um mehr Details zu erhalten und unnötige Prüfungen zu überspringen
RUN npm install --verbose --no-audit

# Projektdateien kopieren
COPY . .

# Anwendung bauen
RUN npm run build

# Zweites Stage für die eigentliche Anwendung
FROM node:18-alpine

# MySQL-Client installieren
RUN apk add --no-cache mysql-client ca-certificates curl busybox-extras

WORKDIR /app

# Nur die notwendigen Dateien aus dem Builder kopieren
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/start.sh ./start.sh

# Nur Produktionsabhängigkeiten installieren
RUN npm install --production --no-optional --no-audit && \
    chmod +x ./start.sh

# Umgebungsvariablen setzen
ENV NODE_ENV=production
ENV PORT=3000

# Umgebungsvariablen für Vite
ENV VITE_ADMIN_USERNAME=admin
ENV VITE_ADMIN_PASSWORD=admin
ENV VITE_DB_HOST=mysql
ENV VITE_DB_PORT=3306
ENV VITE_DB_USER=checkin
ENV VITE_DB_PASSWORD=checkin
ENV VITE_DB_NAME=checkin_db

# SMTP-Konfiguration
ENV VITE_SMTP_HOST="smtp.example.com"
ENV VITE_SMTP_PORT="587"
ENV VITE_SMTP_USER="user@example.com"
ENV VITE_SMTP_PASS="yourpassword"
ENV VITE_SMTP_FROM="noreply@example.com"
ENV VITE_SMTP_TO="recipient@example.com"
ENV VITE_SMTP_SUBJECT="Neuer Besucher Check-In"

# Datenbank-Konfiguration
ENV DB_HOST="mysql"
ENV DB_PORT="3306"
ENV DB_USER="checkin"
ENV DB_PASSWORD="checkin"
ENV DB_NAME="checkin_db"

# Port freigeben
EXPOSE 3000

# Anwendung starten
CMD ["./start.sh"]
