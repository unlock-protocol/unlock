#!/usr/bin/env node

const { argv } = require('yargs')
const Handlebars = require('handlebars')
const path = require('path')
const fs = require('fs-extra')
const networksConfig = require('@unlock-protocol/networks')

const templateValues = (network) => {
  if (!networksConfig[network]) {
    console.error('Please provide a network name')
    process.exit(1)
  }
  return {
    network,
    startBlock: networksConfig[network].startBlock,
    unlockContractAddress: networksConfig[network].unlockAddress,
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

let generationValues
if (argv.network) {
  generationValues = templateValues(argv.network)
} else {
  generationValues = templateValues('winston')
}

generate(generationValues)
