#!/usr/bin/env bash
#
# Simple util to track time taken by various docker backup tasks 
#

timing() {
  command time -f "[$*] took %E" "$@"
}