
FROM node:18-alpine

# Arbeitssverzeichnis setzen
WORKDIR /app

# Pakete für MySQL-Client und andere Abhängigkeiten installieren
RUN apk add --no-cache python3 make g++ ca-certificates curl busybox-extras mysql-client

# Paketdateien kopieren und Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Projektdateien kopieren
COPY . .

# Anwendung bauen
RUN npm run build

# Startskript ausführbar machen
RUN chmod +x ./start.sh

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
