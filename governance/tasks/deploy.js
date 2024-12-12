const { task } = require('hardhat/config')
const { networks } = require('@unlock-protocol/networks')

task('deploy', 'Deploy the entire Unlock protocol')
  .addOptionalParam(
    'unlockAddress',
    'the address of an existing Unlock contract'
  )
  .addOptionalParam('udtAddress', 'the address of an existing UDT contract')
  .addOptionalParam(
    'publicLockAddress',
    'the address of an existing public Lock contract'
  )
  .addOptionalParam('publicLockVersion', 'the version of public Lock to deploy')
  .addOptionalParam('wethAddress', 'the address of the WETH token contract')
  .addOptionalParam(
    'oracleAddress',
    'the address of an existing Uniswap Oracle contract'
  )
  .addOptionalParam(
    'premintAmount',
    'the amount of tokens to be pre-minted when originating UDT'
  )
  .addOptionalParam(
    'liquidity',
    'the amount of liquidity to be added to the WETH<>UDT pool'
  )
  .addOptionalParam('unlockVersion', 'the version of Unlock to deploy')
  .addOptionalParam('estimatedGasForPurchase', 'gas estimate for buying a key')
  .addOptionalParam('locksmithURI', 'the URL locksmith to use in Unlock config')
  .addOptionalParam(
    'owner',
    'address of the owner. defaults to the multisig address set for the network, it uses it'
  )
  .addFlag('setTemplate', 'set the PublicLock instance in Unlock')
  .setAction(
    async ({
      unlockAddress,
      unlockVersion,
      publicLockVersion,
      udtAddress,
      publicLockAddress,
      wethAddress,
      oracleAddress,
      premintAmount,
      liquidity,
      setTemplate,
      estimatedGasForPurchase,
      locksmithURI,
      owner,
    }) => {
      const mainDeployer = require('../scripts/deployments')
      const {
        unlockAddress: newUnlockAddress,
        publicLockAddress: newPublicLockAddress,
      } = await mainDeployer({
        unlockAddress,
        unlockVersion,
        publicLockVersion,
        udtAddress,
        publicLockAddress,
        wethAddress,
        oracleAddress,
        premintAmount,
        liquidity,
        setTemplate,
        estimatedGasForPurchase,
        locksmithURI,
        owner,
      })

      return {
        unlockAddress: newUnlockAddress,
        publicLockAddress: newPublicLockAddress,
      }
    }
  )

task('deploy:udt', 'Deploy Unlock Discount Token proxy').setAction(async () => {
  const udtDeployer = require('../scripts/deployments/udt')
  return await udtDeployer()
})

task('deploy:unlock', 'Deploy Unlock proxy')
  .addOptionalParam('unlockVersion', 'the version of unlock to deploy')
  .setAction(async ({ unlockVersion }) => {
    const unlockDeployer = require('../scripts/deployments/unlock')
    return await unlockDeployer({ unlockVersion })
  })

task('deploy:weth', 'Deploy WETH contract').setAction(async () => {
  const wethDeployer = require('../scripts/deployments/weth')
  return await wethDeployer()
})

task('deploy:oracle', 'Deploy Uniswap Oracle contract')
  .addOptionalParam(
    'uniswapFactoryAddress',
    'the address of an existing Uniswap V3 Factory contract'
  )
  .addOptionalParam('fee', 'the fee of the Uniswap pools to check')
  .setAction(async ({ uniswapFactoryAddress, fee }) => {
    const oracleDeployer = require('../scripts/deployments/oracle')
    return await oracleDeployer({ uniswapFactoryAddress, fee })
  })

task('deploy:template', 'Deploy PublicLock contract')
  .addOptionalParam('publicLockVersion', 'the version of PublicLock to deploy')
  .addOptionalParam(
    'publicLockAddress',
    'the address of a deployed PublicLock contract'
  )
  .setAction(async ({ publicLockVersion, publicLockAddress }) => {
    const templateDeployer = require('../scripts/deployments/publicLock')
    return await templateDeployer({ publicLockVersion, publicLockAddress })
  })

task('deploy:governor', 'Deploy governor contracts')
  .addParam('upAddress', 'address of the ERC20 token to use for governance')
  .addOptionalParam('timelockAddress', 'address of a timelock contract')
  .addFlag('testing', 'lower vesting periods for dev purposes')
  .setAction(async ({ upAddress, timelockAddress, testing }) => {
    const govDeployer = require('../scripts/deployments/governor')
    return await govDeployer({ upAddress, timelockAddress, testing })
  })

task('deploy:keyManager', 'Deploy KeyManager contract')
  .addOptionalParam(
    'locksmiths',
    'addresses for the locksmith signers, comma separated'
  )
  .setAction(async ({ locksmiths }) => {
    const locksmithsArray = !locksmiths ? [] : locksmiths.split(',')

    const keyManagerDeployer = require('../scripts/deployments/keyManager')
    return await keyManagerDeployer(locksmithsArray)
  })

task(
  'deploy:protocol-upgrade',
  'Deploy latest versions of Unlock and PublicLock contracts'
)
  .addOptionalParam('publicLockVersion', 'version for publicLock')
  .addOptionalParam('unlockVersion', 'version for Unlock')
  .addOptionalParam('unlockImplAddress', 'address of deployed impl for Unlock')
  .addOptionalParam('publicLockAddress', 'address of deployed  for Unlock')
  .addFlag('submit', 'submit to multisig')
  .setAction(
    async ({
      publicLockAddress,
      unlockImplAddress,
      publicLockVersion,
      unlockVersion,
      submit,
    }) => {
      const upgradeProtocol = require('../scripts/upgrade/protocol-upgrade')
      await upgradeProtocol({
        publicLockVersion,
        unlockVersion,
        publicLockAddress,
        unlockImplAddress,
        submit,
      })
    }
  )
