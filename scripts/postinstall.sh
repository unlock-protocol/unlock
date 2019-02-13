#!/usr/bin/env bash

# This script runs after npm install or npm ci
# it will install/ci all the subdirectories dependencies
# unless SKIP_SERVICES is set to true

get_json_val() {
  python -c "import json,sys;sys.stdout.write(json.dumps(json.load(sys.stdin)$1))";
}

get_npm_command() {
  local temp=$(echo $npm_config_argv | get_json_val "['original'][0]")
  echo "$temp" | tr -dc "[:alnum:]"
}

if [ "$SKIP_SERVICES" != "true" ]; then

  # Will be either 'install' or 'ci'
  CMD="$(get_npm_command)"

  SERVICES=( paywall smart-contracts unlock-app locksmith tests )

  for i in "${SERVICES[@]}"
  do
    cd $i
    npm $CMD
    cd .. # back to root
  done

  # Copy the parent binaries into the sub projects
  npm run link-parent-bin
fi
