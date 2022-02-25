#!/bin/bash
# Export all GitHub secrets as prefixed ENV

secrets=$1
prefix=$2 

jq -r 'to_entries | .[] | "\(.key) \(.value)\t"' <<< "$secrets" | 
while read -r key value; do
  echo "${prefix}_${key}"=$value >> $GITHUB_ENV
done
