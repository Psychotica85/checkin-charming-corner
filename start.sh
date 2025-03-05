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

# Verwende konfigurierte Datenbank-Host-Adresse
echo "Verwende $DB_HOST für Datenbankverbindungsprüfung"

# Verbindungsversuch mit mysql
until [ $retry_count -eq $max_retries ] || (mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1); do
    echo "Warte auf Datenbankverbindung ($retry_count/$max_retries)..."
    retry_count=$((retry_count+1))
    sleep 2
done

if [ $retry_count -eq $max_retries ]; then
    echo "Warnung: Konnte keine Verbindung zur Datenbank herstellen."
    echo "Starte die Anwendung trotzdem..."
else
    echo "Datenbankverbindung erfolgreich hergestellt!"
fi

echo "SMTP-Konfiguration:"
echo "- SMTP_HOST: $VITE_SMTP_HOST"
echo "- SMTP_PORT: $VITE_SMTP_PORT"
echo "- SMTP_USER: $VITE_SMTP_USER"
echo "- SMTP_FROM: $VITE_SMTP_FROM"
echo "- SMTP_TO: $VITE_SMTP_TO"

# Starte den Server
echo "Starte das Besucher Check-In System..."
node server.js
