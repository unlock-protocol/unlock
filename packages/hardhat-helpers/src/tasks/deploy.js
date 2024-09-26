const { task } = require('hardhat/config')
const { deployContract, deployUpgradeableContract } = require('../deploy')
const path = require('path')

const initializeDeployTask = () =>
  task('deploy:contract', 'Deploy any contract by name')
    .addFlag('proxied', 'deploy using OZ Transparent Proxy', false)
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
      let qualified
      if (contract.includes(':')) {
        qualified = contract
      } else {
        const contractName = path
          .basename(contract)
          .replace('.sol', '')
          .split('V')[0]
        qualified = `${contract}:${contractName}`
      }

      let address, hash
      if (constructorArgs) {
        params = require(`${constructorArgs}`)
        console.log(params)
      }

      if (!proxied) {
        ;({ address, hash } = await deployContract(qualified, params))
      } else {
        console.log(`Deploying using a Transparent proxy:`)
        ;({ address, hash } = await deployUpgradeableContract(
          qualified,
          params
        ))
      }
      console.log(`Contract ${qualified} deployed at ${address} (tx: ${hash})`)
    })

const initialize = () => {
  initializeDeployTask()
}

module.exports = initialize
