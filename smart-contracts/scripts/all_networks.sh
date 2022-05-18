#!/bin/sh
#
# Just a small util to run a hardhat script for all networks
#
# Usage: scripts/all_networks.sh yarn hardhat run scripts/etc...
#

## all networks
all_networks=("rinkeby" "polygon" "xdai" "mainnet" "binance" "optimism")

# run once on localhost (checking for errors)
echo "Run on localhost..."
echo "$@"

## now loop through the above array
for i in "${all_networks[@]}"
do
   echo "> Deploying on $i ..."
   echo "$@" "--network $i"
   $@ "--network $i"
   echo 
done