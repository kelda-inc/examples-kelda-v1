#!/bin/bash
set -e

parent_path="$(command cd "$(dirname "${BASH_SOURCE[0]}")" && command pwd)"
workspace="${parent_path}/kelda-workspace/workspace.yaml"

if [ "${1}" == "--use-demo-cluster" ]; then
    kelda config --workspace "${workspace}" --context kelda-demo-cluster
else
    kelda config --workspace "${workspace}"
fi
