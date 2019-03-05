'use strict'

const Unlock = artifacts.require('Unlock')

async function main () {
  // We can use the `deployed()` truffle helper to retrieve the upgradeable instance
  const deployed = await Unlock.deployed()
  const value = await deployed.value()
  const version = await deployed.version()
  console.log(`Value of Unlock (${version}) deployed instance: ${value.toNumber()}`)
}

// Handle truffle exec
module.exports = function (callback) {
  main().then(() => callback()).catch(err => callback(err))
}
