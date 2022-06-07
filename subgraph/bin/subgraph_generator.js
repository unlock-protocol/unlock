#!/usr/bin/env node

const { argv } = require('yargs')
const Handlebars = require('handlebars')
const path = require('path')
const fs = require('fs-extra')
const networksConfig = require('@unlock-protocol/networks')

const templateValues = (networkName) => {
  if (!networksConfig[networkName]) {
    console.error('Please specify network!')
    process.exit(1)
  }
  const network = networksConfig[networkName]

  return {
    network: networkName,
    startBlock: network.startBlock || 0,
    unlockContractAddress: network.unlockAddress,
    previousDeploys: (network.previousDeploys || []).map((details, index) => ({
      ...details,
      index,
      network: networkName,
    })),
  }
}

const generate = async (generationValues) => {
  const subgraphTemplateFilePath = path.join(
    __dirname,
    '..',
    'subgraph.template.yaml'
  )

  const source = await fs.readFile(subgraphTemplateFilePath, 'utf-8')
  const template = Handlebars.compile(source)
  const result = template(generationValues)
  await fs.writeFile(path.join(__dirname, '..', 'subgraph.yaml'), result)
}

const network = argv.network || 'winston'

const generationValues = templateValues(network)

generate(generationValues)
