#!/usr/bin/env bash

timing() {
  command time -f "[$*] took %E" "$@"
}