#!/bin/bash
# Filter GitHub secrets and export them to ENV

secrets=$1
prefix=$2 # used to filter

jq -r 'to_entries | .[] | select( .key | contains("'$prefix'")) | "\(.key) \(.value)\t"' <<< "$secrets" | 
while read -r key value; do
  echo $key'='$value >> $GITHUB_ENV
done
