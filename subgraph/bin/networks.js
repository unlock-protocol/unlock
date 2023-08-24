#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const networksConfig = require('@unlock-protocol/networks')
const ethers = require('ethers')

const networkFilePath = path.join(__dirname, '..', 'networks.json')
const configFolderPath = path.join(__dirname, '..', 'config')

// Some networks have a custom networkName
const networkName = (n) => {
  return networksConfig[n].subgraph.networkName || n
}

const generateNetworksFile = async () => {
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
}

function setupFolderConfig() {
  // make sure we clean up
  if (fs.pathExistsSync(configFolderPath)) {
    fs.rmSync(configFolderPath, { recursive: true, force: true })
  }
  fs.mkdirSync(configFolderPath)
}

function createNetworkAbi(network, chainName) {
  const networkName = chainName
  const networkFile = {
    network: network.subgraph.networkName,
    unlock: network.unlockAddress,
    unlockStartBlock: network.startBlock,
    unlock2: ethers.constants.AddressZero,
    unlockStartBlock2: network.startBlock,
  }

  if (network.previousDeploys.length > 0) {
    networkFile.unlock2 = network.previousDeploys[0].unlockAddress
    networkFile.unlockStartBlock2 = network.previousDeploys[0].startBlock
  }
  const configPath = path.join(configFolderPath, `${networkName}.json`)
  fs.writeJSONSync(configPath, networkFile, { spaces: 2 })
}

function parseNetworkConfigs() {
  // process all
  setupFolderConfig()
  Object.keys(networksConfig)
    .filter((d) => !['networks', 'default', 'localhost'].includes(d))
    .reduce((acc, chainName) => {
      createNetworkAbi(networksConfig[chainName], chainName)
    }, {})
  console.log(`Configs saved at: ${configFolderPath}`)
}

module.exports = {
  networkName,
  generateNetworksFile,
  parseNetworkConfigs,
}

// execute as standalone
if (require.main === module) {
  generateNetworksFile()
    .then(() => parseNetworkConfigs())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
