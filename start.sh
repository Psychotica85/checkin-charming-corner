
#!/bin/sh

# Verzeichnis für die Datenbank erstellen, falls es nicht existiert
mkdir -p data
chmod 777 data

# Starte den Server
echo "Starte das Gäste Check-In System..."
node server.js
