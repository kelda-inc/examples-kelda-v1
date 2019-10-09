#!/bin/bash
set -euo pipefail

if [[ $# != 1 ]]; then
    echo "usage: $0 <path_to_license>"
    exit 1
fi

echo "Setting up Kelda minion in the cluster..."
kelda setup-minion --license "$1"
echo

echo "Setting up the registry credentials for pulling Magda images..."

cd "$(dirname "$0")"/../magda-kelda-config
kubectl apply -f ./setup
echo

echo "Running \`kelda config\` to setup user configuration..."
kelda config
echo

echo "Done! You can type \`kelda dev ./magda-web-server\` to start trying Kelda!"
