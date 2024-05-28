#!/usr/bin/env bash

ETH_NODE_ROOT=$REPO_ROOT/docker/development/eth-node/packages

# copy packages folders
rm -rf $ETH_NODE_ROOT
mkdir $ETH_NODE_ROOT

# function to copy a package into the eth-node packages folder
copy_package () {
  cp -R $REPO_ROOT/packages/$1  $ETH_NODE_ROOT/$1
}

copy_package "types"
copy_package "tsconfig"
copy_package "hardhat-plugin"
copy_package "networks"
copy_package "contracts"
copy_package "eslint-config"