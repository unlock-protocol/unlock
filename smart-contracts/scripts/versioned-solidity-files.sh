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
    npm uninstall remix # throw errors on install
    npm i -S hardhat

    # create hardhat config
    echo """
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
  }
}

module.exports = {
  solidity : {
    compilers: [
      { version: '0.4.24', settings },
      { version: '0.4.25', settings },
      { version: '0.5.7', settings },
      { version: '0.5.9', settings },
      { version: '0.5.14', settings },
      { version: '0.5.17', settings },
      { version: '0.6.12', settings },
      { version: '0.7.6', settings },
      { version: '0.8.4', settings },
    ],
  },
};
""" >> hardhat.config.js

    # flatten contracts
    hardhat flatten ./contracts/Unlock.sol > "$dst/$version/UnlockV$version.sol"
    hardhat flatten ./contracts/PublicLock.sol > "$dst/$version/PublicLockV$version.sol"

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