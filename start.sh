
#!/bin/sh

# Bessere Debug-Ausgaben
set -e
echo "=== Besucher Check-In System Starter ==="
echo "Starte mit Konfiguration:"
echo "- NODE_ENV: $NODE_ENV"
echo "- PORT: $PORT"

# Verzeichnis für die Datenbank erstellen und Berechtigungen setzen
echo "Konfiguriere Datenverzeichnis..."
mkdir -p /app/data
chmod 777 /app/data
chown node:node /app/data || echo "Konnte Verzeichnisbesitzer nicht ändern (normales Verhalten in bestimmten Umgebungen)"

# Datenbankverzeichnis prüfen
echo "Prüfe Datenbankverzeichnis..."
ls -la /app/data

# Datenbankzugriff testen
echo "Teste Datenbankzugriff..."
touch /app/data/test_permissions.txt
echo "Berechtigungstest" > /app/data/test_permissions.txt
cat /app/data/test_permissions.txt
echo "Dateizugriff erfolgreich!"

# Umgebungsvariablen für SMTP anzeigen (ohne Passwort)
echo "SMTP-Konfiguration:"
echo "- SMTP_HOST: $VITE_SMTP_HOST"
echo "- SMTP_PORT: $VITE_SMTP_PORT"
echo "- SMTP_USER: $VITE_SMTP_USER"
echo "- SMTP_FROM: $VITE_SMTP_FROM"
echo "- SMTP_TO: $VITE_SMTP_TO"
echo "- SMTP_PASS: $(if [ -n "$VITE_SMTP_PASS" ]; then echo "gesetzt"; else echo "nicht gesetzt"; fi)"

# Starte den Server
echo "Starte das Besucher Check-In System..."
node server.js
