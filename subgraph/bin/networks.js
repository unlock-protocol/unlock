#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const networksConfig = require('@unlock-protocol/networks')
const writeYamlFile = require('write-yaml-file')
const manifest = require('../src/manifest.js')

const manifestFilePath = path.join(__dirname, '..', 'subgraph.yaml')

// Some networks have a custom networkName
const networkName = (n) => {
  return networksConfig[n].subgraph.networkName || n
}

const generateManifestFile = async (network) => {
  console.log(`generate the manifest file for ${network}!`)
  fs.unlinkSync(manifestFilePath)

  const { previousDeploys, unlockAddress, startBlock } = networksConfig[network]

  // If the network has multiple deploys of Unlock, we need to add them to the manifest!
  // Note: the networks file will still be used...
  const dataSource = manifest.dataSources.find(
    (source) => source.name === 'Unlock'
  )
  dataSource.network = networkName(network)

  if (previousDeploys) {
    previousDeploys.forEach((previous, i) => {
      const newSource = {
        ...dataSource,
        name: `Unlock${i}`,
      }
      newSource.source = {
        ...newSource.source,
        address: previous.unlockAddress,
        startBlock: previous.startBlock
      }
      manifest.dataSources.push(newSource)
    })

    // main data source
    dataSource.source.address = unlockAddress
    dataSource.source.startBlock = startBlock
  }

  manifest.templates.forEach((template) => {
    template.network = networkName(network)
  })

  await writeYamlFile(manifestFilePath, manifest, { noRefs: true })
  console.log(`Manifest file saved at: ${manifestFilePath}`)
}

module.exports = {
  networkName,
  generateManifestFile,
}

// execute as standalone
if (require.main === module) {
  generateManifestFile()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
