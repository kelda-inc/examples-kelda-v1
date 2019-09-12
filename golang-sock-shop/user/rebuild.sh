#!/bin/bash
set -e

# Cd into the script's directory so that we're running `go build` relative to
# the correct path.
cd "$(dirname "${BASH_SOURCE[0]}")"

echo "Building binary with 'CGO_ENABLED=0 GOOS=linux go build -o user .'"
CGO_ENABLED=0 GOOS=linux go build -o user .
echo "Done. Kelda should automatically sync the 'user' file over now."
