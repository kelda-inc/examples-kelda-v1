#!/bin/sh

root_path="$(command cd "$(dirname "${BASH_SOURCE[0]}")" && command pwd)"
kubeconfig_path="${root_path}/demo-kubeconfig"

export PS1="[kelda-demo] $PS1"
export KUBECONFIG="${kubeconfig_path}"
export USING_DEMO_KELDA_CLUSTER="true"

echo "You are now connected to the Kelda demo cluster."
