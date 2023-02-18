#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const networksConfig = require('@unlock-protocol/networks')

const networkFilePath = path.join(__dirname, '..', 'networks.json')

// Some networks have a custom networkName
const networkName = (n) => {
  return networksConfig[n].subgraph.networkName || n
}

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
      [networkName(chainName)]: unlock,
    }
  }, {})

fs.writeJSONSync(networkFilePath, networks, { spaces: 2 })

console.log(`Networks file saved at: ${networkFilePath}`)

module.exports = {
  networkName,
}
