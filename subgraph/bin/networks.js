#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const networksConfig = require('@unlock-protocol/networks')

const networkFilePath = path.join(__dirname, '..', 'networks.json')

const networks = Object.keys(networksConfig)
  .filter((d) => !['networks', 'default', 'localhost'].includes(d))
  .reduce((acc, chainName) => {
    const {
      startBlock,
      unlockAddress: unlockContractAddress,
      previousDeploys,
    } = networksConfig[chainName]

    const previous = {}
    if (previousDeploys) {
      previousDeploys.forEach(({ unlockAddress: address, startBlock }, i) => {
        previous[`Unlock${i}`] = { address, startBlock }
      })
    }

    const unlock = {
      Unlock: {
        address: unlockContractAddress,
        startBlock,
      },
      ...previous,
    }

    return {
      ...acc,
      [chainName]: unlock,
    }
  }, {})

fs.writeJSONSync(networkFilePath, networks, { spaces: 2 })

console.log(`Networks file saved at: ${networkFilePath}`)
