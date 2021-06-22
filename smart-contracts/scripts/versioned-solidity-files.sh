#! /bin/sh

# all the commits  
declare -a arr=( "d2a3cc65" "90d2192c" "32dd70fc" "9d7b1b98" "b7220ca3" "fb826f9" "31d7d1c" "3660575" "a4bbbfcef6c" "52ea34ab4")

# keep track of version number
version=0

# use node 10 
nvm use 10
npm i -g truffle-flattener

## now loop through the above array
for commit in "${arr[@]}"
do
   echo "version $version..."
   sh -c "git checkout ${commit}"

   # store in some far away path for now
    dst=$(realpath ../../unlock-versions)

    # create folders
    mkdir -p $dst
    mkdir -p $dst/$version

    # update node_modules
    rm -rf node_modules
    npm i 

    # flatten contracts
    truffle-flattener ./contracts/Unlock.sol > $dst/$version/Unlock.sol
    truffle-flattener ./contracts/PublicLock.sol > $dst/$version/PublicLock.sol

    rm package-lock.json
    
    # next version 
    ((version=version+1))
done



## Full run gave two issues for v2 and v5 with
## Error: There is a cycle in the dependency graph, can't compute topological ordering. Files:
## @poanet/solidity-flattener not working either

# v2 
# git checkout 90d2192c
# rm -rf node_modules
# remove remix from devDeps
# yarn add hardhat
# truffle-flattener contracts/Unlock.sol
# ╰─$ npx hardhat flatten contracts/Unlock.sol
# (node:47578) Warning: N-API is an experimental feature and could change at any time.
# Error HH411: The library openzeppelin-eth, imported from unlock/smart-contracts/contracts/Unlock.sol, is not installed. Try installing it using npm.
# yarn add openzeppelin-eth