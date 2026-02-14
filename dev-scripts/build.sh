#!/bin/bash

set -e

upload=0
# If args include --upload or --push also upload
if [[ " $@ " =~ " --upload " ]] || [[ " $@ " =~ " --push " ]]; then
    upload=1
fi

script_path=$(dirname "$0")
cd "$script_path/.."
docker compose build
if [ $upload -eq 1 ]; then
    docker compose push
fi
