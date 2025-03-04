
FROM node:18-alpine

# Arbeitssverzeichnis setzen
WORKDIR /app

# Pakete für MySQL-Client und andere Abhängigkeiten installieren
RUN apk add --no-cache python3 make g++ ca-certificates curl procps busybox-extras mysql-client

# Paketdateien kopieren und Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Projektdateien kopieren
COPY . .

# Anwendung bauen
RUN npm run build

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

# Datenbank-Konfiguration (standardmäßig MySQL)
ENV DB_HOST="mysql"
ENV DB_PORT="3306"
ENV DB_USER="checkin"
ENV DB_PASSWORD="checkin"
ENV DB_NAME="checkin_db"

# Standard-Anmeldedaten für Admin-Bereich
ENV VITE_ADMIN_USERNAME=admin
ENV VITE_ADMIN_PASSWORD=admin

# Port freigeben
EXPOSE 3000

# Anwendung starten
CMD ["node", "server.js"]
