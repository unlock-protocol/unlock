#!/usr/bin/env bash

# This script removes all transient directories (node_modules and build results)
# To only be used after you've stopped all servers

NUKE_DIRS="node_modules locksmith/node_modules/ locksmith/development.sqlite3 locksmith/logs/*.log tests/node_modules/ smart-contracts/node_modules/ smart-contracts/.zos.session smart-contracts/zos.dev-1984.json smart-contracts/ethereum smart-contracts/build smart-contracts/build/contracts/*.json unlock-app/node_modules/ unlock-app/build unlock-app/coverage unlock-app/src/out unlock-app/src/.next unlock-app/coverage unlock-app/src/out unlock-app/src/.next paywall/node_modules/ paywall/build paywall/coverage paywall/src/out paywall/src/.next paywall/coverage paywall/src/out paywall/src/.next paywall/static/paywall.min.js */node_modules .*/node_modules "

# First check if ganache is running
GANACHE_PORT=8545
lsof -i :$GANACHE_PORT >> /dev/null
if [ $? -eq 0 ]; then
  echo "Please make sure you stop ganache first"
  exit 1
fi

# Then check if next is running
NEXT_PORT=3000
lsof -i :$NEXT_PORT >> /dev/null
if [ $? -eq 0 ]; then
  echo "Please make sure you stop the nextjs application first"
  exit 1
fi

# Then check if locksmith is running
LOCKSMITH_PORT=8080
lsof -i :$LOCKSMITH_PORT >> /dev/null
if [ $? -eq 0 ]; then
  echo "Please make sure you stop the locksmith application first"
  exit 1
fi



# Ask for confirmation
echo "This command will delete $NUKE_DIRS"
read -n1 -p "Are you sure? Please type 'y': "
echo

# Nuke
case $REPLY in
   y)
   echo "This may take a couple seconds..."
   rm -rf $NUKE_DIRS
   echo "Transient directory removed..."
   ;;
   * )
   echo "Aborting, no directory was removed"
   ;;
esac

