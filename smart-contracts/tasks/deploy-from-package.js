const { task } = require('hardhat/config')

task('deploy-from-package', 'Deploys the full protocol based on the released npm module').addOptionalParam(
  'owner',
  'the address of the owner. If unset, use the multisig from the package configuration'
).setAction(async ({ owner }) => {
  // eslint-disable-next-line global-require
  const deployer = require('../scripts/deployments/deploy-from-package')
  return await deployer(owner)
})
