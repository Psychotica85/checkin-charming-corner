
#!/bin/sh

# Verzeichnis für die Datenbank erstellen, falls es nicht existiert
mkdir -p data
chmod 777 data

# Initialisierung der Datenbank prüfen
echo "Prüfe Datenbankverbindung..."
if [ ! -f "./data/checkin.db" ]; then
  echo "Datenbank wird initialisiert..."
fi

# Starte den Server
echo "Starte das Besucher Check-In System..."
node server.js
