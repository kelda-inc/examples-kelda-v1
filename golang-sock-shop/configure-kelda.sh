#!/bin/bash
set -e

parent_path="$(dirname "${BASH_SOURCE[0]}")"
workspace="${parent_path}/kelda-config/workspace.yaml"

if [ "${USING_DEMO_KELDA_CLUSTER}" == "true" ]; then
    kelda config --workspace "${workspace}" --context kelda-demo
else
    kelda config --workspace "${workspace}"
fi
