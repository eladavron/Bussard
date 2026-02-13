#!/bin/bash

script_path=$(dirname "$0")
cd "$script_path/.."
docker compose build
docker compose push