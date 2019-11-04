#!/bin/bash
set -euo pipefail

# Use the absolute path so that we properly resolve paths after changing
# directories if the script was invoked as a relative path.
bin_path="$(command cd "$(dirname "${BASH_SOURCE[0]}")" && command pwd)"
root_dir="$(dirname "${bin_path}")"
export KUBECONFIG="${root_dir}/bin/kubeconfig"

function _kelda() {
    "${root_dir}/bin/kelda" $@
}

function setup_kelda_config() {
    _kelda config --workspace "${root_dir}/magda-kelda-config/workspace.yaml" --context kelda-demo
}

echo "This demo connects to a remote Kelda cluster maintained by the Kelda team."
echo "For non-demo usage, the cluster would be created and maintained by your company."
echo "This cluster is shared with other trial users of Kelda, and should only be used for the demo."
echo

# Use printf so that there's no trailing newline.
printf "Going to run \`kelda config\` to setup the local Kelda configuration... Press [Enter] to continue."
read
echo
setup_kelda_config

echo
printf "Going to run \`kelda dev magda-web-server\`... Press [Enter] to continue."
read
echo
_kelda dev "${root_dir}/magda-web-server"
