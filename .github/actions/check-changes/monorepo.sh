#!/usr/bin/env bash

# chmod +x ./scripts/monorepo.sh
TARGETS='[
        "locksmith",
        "packages/unlock-js",
        "packages/paywall",
        "newsletter",
        "smart-contracts",
        "smart-contract-extensions",
        "unlock-protocol-com",
        "wedlocks",
        "unlock-app" 
        ]'
main() {
  targets=($(jq -r .[] <<< $TARGETS))
  changed=()

  for f in ${targets[@]}; do 
    has_changed="$(scripts/monorepo.sh $f gh-actions)"
    if [ "$has_changed" == "changed" ]; then
      changed+="$f"
    fi
  done
  json_array=$(printf '%s\n' "${changed[@]}" | jq -R . | jq -s .)
  echo $json_array
}

main
# echo "::set-output name=changed::$changed"

