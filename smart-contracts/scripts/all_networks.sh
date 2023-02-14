#!/bin/sh
#
# Just a small util to run a hardhat script for all networks
#
# Usage: scripts/all_networks.sh run scripts/etc...
# Usage: scripts/all_networks.sh unlock:info
#

## all networks
all_networks=(
   "goerli" 
   "mumbai" 
   "polygon"
   "gnosis" 
   "bsc" 
   "optimism"
   "celo"
   "arbitrum"
   "avalanche"
   "mainnet" 
)

# dry run once on localhost (just checking for errors)
# echo "Run on localhost..."
# echo "$@"
# $@

## now loop through all networks
for i in "${all_networks[@]}"
do
   echo "> Executing on $i ..."
   echo "yarn hardhat $@ --network $i"
   yarn hardhat $@ --network $i
   echo 
done