#! /bin/sh

# run all checks
yarn workspace @unlock-protocol/networks check:keys
yarn workspace @unlock-protocol/networks check:tokens
yarn workspace @unlock-protocol/networks check:hooks
yarn workspace @unlock-protocol/networks check:verify

yarn workspace @unlock-protocol/subgraph check

yarn workspace @unlock-protocol/governance check
yarn workspace @unlock-protocol/governance check:multisig
yarn workspace @unlock-protocol/governance check:cross-chain
      