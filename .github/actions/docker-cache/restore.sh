#!/usr/bin/env bash
#
# Restore docker buildkit cache from tarball, so it can be directly reused by CI tasks
# This is used here to bring back yarn V2 cache 
# which allow to build without re-fetching modules from distant package repo
# thx to https://github.com/Mahoney-playground/docker-cache-action 

set -euo pipefail
# shellcheck source=timing.sh
. "${BASH_SOURCE%/*}/timing.sh"

main() {
  local cache_tar=$1

  if [[ -f "$cache_tar" ]]; then
    ls -lh "$cache_tar"
    timing sudo service docker stop
    # mv is c. 25 seconds faster than rm -rf here
    timing sudo mv /var/lib/docker "$(mktemp -d --dry-run)"
    sudo mkdir -p /var/lib/docker
    timing sudo tar -xf "$cache_tar" -C /var/lib/docker
    timing sudo service docker start
  else
    # Slim docker down - comes with 3GB of data we don't want to backup
    timing docker system prune -a -f --volumes
  fi
}

main "$@"