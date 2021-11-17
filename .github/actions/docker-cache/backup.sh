#!/usr/bin/env bash

set -euo pipefail
# shellcheck source=timing.sh
. "${BASH_SOURCE%/*}/timing.sh"

main() {
  local cache_tar=$1
  local cache_dir
  cache_dir=$(dirname "$cache_tar")

  mkdir -p "$cache_dir"
  rm -f "$cache_tar"

  timing sudo service docker stop
  timing sudo /bin/tar -c -f "$cache_tar" -C /var/lib/docker .
  sudo chown "$USER:$(id -g -n "$USER")" "$cache_tar"
  ls -lh "$cache_tar"
}

main "$@"