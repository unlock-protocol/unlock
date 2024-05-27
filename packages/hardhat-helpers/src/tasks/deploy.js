const { task } = require('hardhat/config')
const { deployContract, deployUpgradeableContract } = require('../deploy')
const path = require('path')

task('deploy:contract', 'Deploy any contract by name')
  .addFlag('proxied', 'deploy using OZ Transparent Proxy')
  .addParam('contract', 'the path of the contract to deploy')
  .addOptionalParam(
    'constructorArgs',
    'the absolute path of a file with constructor args - ex. `pwd`/scripts/args.js'
  )
  .addOptionalVariadicPositionalParam(
    'params',
    'List of deployment args to pass to the constructor'
  )
  .setAction(async ({ contract, params, proxied, constructorArgs }) => {
    const contractName = path
      .basename(contract)
      .replace('.sol', '')
      .split('V')[0]
    const qualified = `${contract}:${contractName}`

    let address, hash

    if (constructorArgs) {
      params = require(`${constructorArgs}`)
      console.log(params)
    }

    if (proxied) {
      ;({ address, hash } = await deployContract(qualified, params))
    } else {
      console.log(`Deploying using a Transparent proxy:`)
      ;({ address, hash } = await deployUpgradeableContract(qualified, params))
    }
    console.log(`Contract ${qualified} deployed at ${address} (tx: ${hash})`)
  })
