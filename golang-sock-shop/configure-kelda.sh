#!/bin/bash
set -e

parent_path="$(command cd "$(dirname "${BASH_SOURCE[0]}")" && command pwd)"
workspace="${parent_path}/kelda-config/workspace.yaml"

if [ "${USING_DEMO_KELDA_CLUSTER}" == "true" ]; then
    kelda config --workspace "${workspace}" --context kelda-demo
else
    kelda config --workspace "${workspace}"
fi
