
#!/bin/sh

# Bessere Debug-Ausgaben
set -e
echo "=== Besucher Check-In System Starter ==="
echo "Starte mit Konfiguration:"
echo "- NODE_ENV: $NODE_ENV"
echo "- PORT: $PORT"

# Datenbankverbindung testen
echo "Prüfe MySQL-Verbindung..."
max_retries=30
retry_count=0

until mysqladmin -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" ping --silent || [ $retry_count -eq $max_retries ]; do
    echo "Warte auf MySQL-Verbindung ($retry_count/$max_retries)..."
    retry_count=$((retry_count+1))
    sleep 2
done

if [ $retry_count -eq $max_retries ]; then
    echo "Fehler: Konnte keine Verbindung zur MySQL-Datenbank herstellen."
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Benutzer: $DB_USER"
    exit 1
fi

echo "MySQL-Verbindung erfolgreich hergestellt"

# Umgebungsvariablen für SMTP anzeigen (ohne Passwort)
echo "SMTP-Konfiguration:"
echo "- SMTP_HOST: $VITE_SMTP_HOST"
echo "- SMTP_PORT: $VITE_SMTP_PORT"
echo "- SMTP_USER: $VITE_SMTP_USER"
echo "- SMTP_FROM: $VITE_SMTP_FROM"
echo "- SMTP_TO: $VITE_SMTP_TO"
echo "- SMTP_PASS: $(if [ -n "$VITE_SMTP_PASS" ]; then echo "gesetzt"; else echo "nicht gesetzt"; fi)"

# Umgebungsvariablen für Datenbank anzeigen (ohne Passwort)
echo "Datenbank-Konfiguration:"
echo "- DB_HOST: $DB_HOST"
echo "- DB_PORT: $DB_PORT"
echo "- DB_USER: $DB_USER"
echo "- DB_NAME: $DB_NAME"
echo "- DB_PASSWORD: $(if [ -n "$DB_PASSWORD" ]; then echo "gesetzt"; else echo "nicht gesetzt"; fi)"

# Starte den Server
echo "Starte das Besucher Check-In System..."
node server.js
