const { networks } = require('@unlock-protocol/networks')
const fs = require('fs-extra')

const keysToIgnore = ['publicProvider', 'provider']

const filePath = './src/networks.json'
const filtered = {}

Object.keys(networks).forEach((chainId) => {
  if (chainId === 'networks') return
  const net = networks[chainId]
  keysToIgnore.forEach((k) => delete net[k])
  filtered[chainId] = net
})

fs.outputJSONSync(filePath, filtered, { spaces: 2 })

console.log(`networks saved to ${filePath}.`)
