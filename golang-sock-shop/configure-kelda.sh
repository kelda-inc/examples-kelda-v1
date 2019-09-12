#!/bin/sh
set -e

parent_path="$(dirname "${BASH_SOURCE[0]}")"
cd "${parent_path}/kelda-config"
kelda config
