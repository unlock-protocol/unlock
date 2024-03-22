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
      // eslint-disable-next-line global-require
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
  // eslint-disable-next-line global-require
  const udtDeployer = require('../scripts/deployments/udt')
  return await udtDeployer()
})

task('deploy:unlock', 'Deploy Unlock proxy')
  .addOptionalParam('unlockVersion', 'the version of unlock to deploy')
  .setAction(async ({ unlockVersion }) => {
    // eslint-disable-next-line global-require
    const unlockDeployer = require('../scripts/deployments/unlock')
    return await unlockDeployer({ unlockVersion })
  })

task('deploy:weth', 'Deploy WETH contract').setAction(async () => {
  // eslint-disable-next-line global-require
  const wethDeployer = require('../scripts/deployments/weth')
  return await wethDeployer()
})

task('deploy:oracle', 'Deploy Uniswap Oracle contract')
  .addOptionalParam(
    'uniswapFactoryAddress',
    'the address of an existing Uniswap V2 Factory contract'
  )
  .setAction(async ({ uniswapFactoryAddress }) => {
    // eslint-disable-next-line global-require
    const oracleDeployer = require('../scripts/deployments/oracle')
    return await oracleDeployer({ uniswapFactoryAddress })
  })

task('deploy:template', 'Deploy PublicLock contract')
  .addOptionalParam('publicLockVersion', 'the version of unlock to deploy')
  .setAction(async ({ publicLockVersion }) => {
    // eslint-disable-next-line global-require
    const templateDeployer = require('../scripts/deployments/publicLock')
    return await templateDeployer({ publicLockVersion })
  })

task('deploy:serializer', 'Deploy LockSerializer').setAction(async () => {
  // eslint-disable-next-line global-require
  const serializerDeployer = require('../scripts/deployments/serializer')
  return await serializerDeployer()
})

task('deploy:governor', 'Deploy Governor Alpha contracts')
  .addParam('udtAddress', 'address of the ERC20 token to use for governance')
  .addOptionalParam('timelockAddress', 'address of a timelock contract')
  .addFlag('testing', 'lower vesting periods for dev purposes')
  .setAction(async ({ udtAddress, timelockAddress, testing }) => {
    // eslint-disable-next-line global-require
    const govDeployer = require('../scripts/deployments/governor')
    return await govDeployer({ udtAddress, timelockAddress, testing })
  })

task('deploy:keyManager', 'Deploy KeyManager contract')
  .addOptionalParam(
    'locksmiths',
    'addresses for the locksmith signers, comma separated'
  )
  .setAction(async ({ locksmiths }) => {
    const locksmithsArray = !locksmiths ? [] : locksmiths.split(',')

    // eslint-disable-next-line global-require
    const keyManagerDeployer = require('../scripts/deployments/keyManager')
    return await keyManagerDeployer(locksmithsArray)
  })

task(
  'deploy:protocol-upgrade',
  'Deploy latest versions of Unlock and PublicLock contracts'
)
  .addParam('publicLockVersion', 'version for publicLock')
  .addParam('unlockVersion', 'version for Unlock')
  .setAction(async ({ publicLockVersion, unlockVersion }, { ethers }) => {
    // eslint-disable-next-line global-require
    const deployPublicLock = require('../scripts/deployments/publicLock')

    // eslint-disable-next-line global-require
    const deployImpl = require('../scripts/upgrade/prepare')

    const { chainId } = await ethers.provider.getNetwork()
    const { unlockAddress, name } = networks[chainId]
    console.log(`Deploying to ${name}(${chainId}) - Unlock: ${unlockAddress}`)

    // deploy publicLock
    const publicLockAddress = await deployPublicLock({ publicLockVersion })

    // deploy unlock impl
    const unlockImplAddress = await deployImpl({
      proxyAddress: unlockAddress,
      contractName: 'Unlock',
      contractVersion: unlockVersion,
    })

    return { publicLockAddress, unlockImplAddress }
  })
