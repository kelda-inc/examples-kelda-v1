#!/bin/bash
#
# Copyright 2017 Istio Authors
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

set -o errexit

VERSION="v1"
PREFIX="gcr.io/bookinfo-images"
SCRIPTDIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

pushd "$SCRIPTDIR/productpage"
  docker build --pull -t "${PREFIX}/productpage:${VERSION}" .
popd

pushd "$SCRIPTDIR/details"
  docker build --pull -t "${PREFIX}/details:${VERSION}" --build-arg service_version=v1 .
popd

pushd "$SCRIPTDIR/reviews"
  #java build the app.
  docker run --rm -u root -v "$(pwd)":/home/gradle/project -w /home/gradle/project gradle:4.8.1 gradle clean build
  pushd reviews-wlpcfg
    docker build --pull -t "${PREFIX}/reviews:${VERSION}"  --build-arg service_version=v3 \
	   --build-arg enable_ratings=true --build-arg star_color=red .
  popd
popd

pushd "$SCRIPTDIR/ratings"
  docker build --pull -t "${PREFIX}/ratings:${VERSION}" --build-arg service_version=v2 .
popd

pushd "$SCRIPTDIR/mongodb"
  docker build --pull -t "${PREFIX}/mongodb:${VERSION}" .
popd

for svc in productpage details reviews ratings mongodb; do
  docker push "${PREFIX}/${svc}:${VERSION}"
done
