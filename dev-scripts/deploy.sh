#!/bin/bash

script_path=$(dirname "$0")
cd "$script_path/.."
docker compose pull
docker compose up -d