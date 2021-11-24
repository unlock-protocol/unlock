#!/usr/bin/env bash
#
# Check for changes based on git history
# Directories to be scannned should be passed as a stringified JSON array to env $TARGETS
# 

main() {
  targets=($(jq -r .[] <<< $TARGETS))
  changed=()

  for f in ${targets[@]}; do 
    has_changed="$(scripts/monorepo.sh $f gh-actions)"
    if [ "$has_changed" == "changed" ]; then
      changed+="$f"
    fi
  done
  if [ ${#changed[@]} -eq 0 ]; then
    echo "[]"
  else
    json_array=$(printf '%s\n' "${changed[@]}" | jq -R . | jq -sc .)
    echo $json_array
  fi
}

main

