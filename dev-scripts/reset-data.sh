#!/usr/bin/env bash

ROOT_DIR="$( dirname $( dirname "$(readlink -f "${BASH_SOURCE[0]}")" ) )"
pushd $ROOT_DIR > /dev/null
docker compose down
docker volume rm $(docker volume ls -q)
popd > /dev/null