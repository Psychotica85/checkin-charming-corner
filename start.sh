
#!/bin/sh

# Verzeichnis für die Datenbank erstellen, falls es nicht existiert
mkdir -p /app/data
chmod 777 /app/data

# Initialisierung der Datenbank prüfen
echo "Prüfe Datenbankverzeichnis..."
ls -la /app/data

# Umgebungsvariablen anzeigen (ohne sensible Daten)
echo "Umgebungsvariablen:"
echo "NODE_ENV=$NODE_ENV"
echo "PORT=$PORT"
echo "VITE_ADMIN_USERNAME=$VITE_ADMIN_USERNAME"
echo "VITE_SMTP_HOST=$VITE_SMTP_HOST"
echo "VITE_SMTP_PORT=$VITE_SMTP_PORT"
echo "VITE_SMTP_USER=$VITE_SMTP_USER"
echo "VITE_SMTP_FROM=$VITE_SMTP_FROM"
echo "VITE_SMTP_TO=$VITE_SMTP_TO"

# Starte den Server
echo "Starte das Besucher Check-In System..."
node server.js
