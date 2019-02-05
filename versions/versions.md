# Versions

This document is meant to be a convenient reference to assist developers in checking out the desired old version of `Unlock.sol` or `PublicLock.sol` for reference/debugging purposes.

Use the command `$ git checkout <commit_hash_here>`to view the unlock repository at this point in time.

After the upgrade to `Unlock.sol` V1, we'll need to modify our test suite to use the artifacts from this directory when testing Unlock V0, so: `const Unlock = artifacts.require('../../versions/Unlock_V0.json')`

(Note: It's possible that the artifacts.require syntax won't work for this use case. If this is the case, we'll need to look at using truffle-contract instead: https://github.com/trufflesuite/truffle/tree/master/packages/truffle-contract )

## tag-V0

- commit hash: 93db1e393f88d9af4ecc3921eadaeddc61de255a

### Unlock.sol Deployed Addresses

- Rinkeby: 0x88944d65f44a22ad4aec7baf1d77a7ab634df001
- Mainnet: 0x51783f6117d36c3c782cf2d0b33bd5bc6b9470c7

## tag-V1

- commit hash: <PLACEHOLDER>

### Unlock.sol Deployed Addresses

- Rinkeby: <PLACEHOLDER>
- Mainnet: <PLACEHOLDER>
