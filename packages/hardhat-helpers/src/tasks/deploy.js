const { task } = require('hardhat/config')

task('deploy:contract', 'Deploy any contract by name')
  .addOptionalParam('contract', 'the path of the contract to deploy')
  .setAction(async ({ contract }) => {
    const contractDeployer = require('../scripts/any-contract')
    return await contractDeployer({ contract })
  })
