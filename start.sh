
#!/bin/sh

# Bessere Debug-Ausgaben
set -e
echo "=== Besucher Check-In System Starter ==="
echo "Starte mit Konfiguration:"
echo "- NODE_ENV: $NODE_ENV"
echo "- PORT: $PORT"

# Datenbankverbindung testen (Verwendung von mariadb-admin statt mysqladmin)
echo "Prüfe MySQL/MariaDB-Verbindung..."
max_retries=30
retry_count=0

# Prüfe, welches Kommando verfügbar ist (mysql, mariadb-admin oder mysqladmin)
if command -v mariadb-admin >/dev/null 2>&1; then
    DB_COMMAND="mariadb-admin"
    echo "Verwende mariadb-admin für Datenbankverbindungsprüfung"
elif command -v mysql >/dev/null 2>&1; then
    DB_COMMAND="mysql"
    echo "Verwende mysql für Datenbankverbindungsprüfung"
else
    DB_COMMAND="mysqladmin"
    echo "Verwende mysqladmin (veraltet) für Datenbankverbindungsprüfung"
fi

# Verbindungsversuch mit dem passenden Kommando
until [ $retry_count -eq $max_retries ] || ($DB_COMMAND -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1); do
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
