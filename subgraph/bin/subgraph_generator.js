#!/usr/bin/env node

const { argv } = require('yargs')
const Handlebars = require('handlebars')
const path = require('path')
const fs = require('fs-extra')

const templateValues = (network) => {
  let address
  let networkName
  let startBlock = 0
  switch (network.toLowerCase()) {
    case 'winston':
      address = '0x559247Ec8A8771E8C97cDd39b96b9255651E39C5'
      networkName = 'winston'
      break
    case 'kovan':
      address = '0x0B9fe963b789151E53b8bd601590Ea32F9f2453D'
      networkName = 'kovan'
      break
    case 'rinkeby':
      address = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'
      networkName = 'rinkeby'
      break
    case 'ropsten':
      address = '0x37855dcf04d3dd44bc7da63da7a25f9b006364e5'
      networkName = 'ropsten'
      startBlock = 8366421
      break
    case 'mainnet':
      address = '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13'
      networkName = 'mainnet'
      break
    case 'xdai':
      address = '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863'
      networkName = 'xdai'
      break
    case 'matic':
      address = '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863'
      networkName = 'matic'
      break
    default:
      console.error(
        'Please provide a network name [winston, kovan, rinkeby, mainnet, xdai, matic]'
      )
  }

  return { network: networkName, startBlock, unlockContractAddress: address }
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
