#!/usr/bin/env bash
#
# Backup docker buildkit mount cache to a tarball, so it can be restored btw CI tasks
# Mostly used to backup yarn v2 modules cache and speed up yarn install
# thx to https://github.com/Mahoney-playground/docker-cache-action

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