
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
    echo "Warnung: Konnte keine Verbindung zur MySQL-Datenbank herstellen."
    echo "Starte die Anwendung trotzdem..."
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
