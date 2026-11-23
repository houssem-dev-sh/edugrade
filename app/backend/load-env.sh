#!/bin/bash
# Script pour charger les variables d'environnement
# Usage : source load-env.sh

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Variables d'environnement chargées depuis .env"
else
    echo "❌ Fichier .env non trouvé !"
    exit 1
fi
