const { task, run } = require('hardhat/config')
const { networks } = require('@unlock-protocol/networks')

task('set', 'Various setters for Unlock contracts')
  .addOptionalParam(
    'unlockAddress',
    'the address of an existing Unlock contract'
  )
  .addOptionalParam('udtAddress', 'the address of an existing UDT contract')
  .addOptionalParam('wethAddress', 'the address of the WETH token contract')
  .addOptionalParam(
    'oracleAddress',
    'the address of the Uniswap Oracle contract'
  )
  .addOptionalParam(
    'publicLockAddress',
    'the address of an existing public Lock contract'
  )
  .addOptionalParam('estimatedGasForPurchase', 'gas estimate for buying a key')
  .addOptionalParam('locksmithURI', 'the locksmith URL to use in Unlock config')
  .setAction(
    async (
      {
        publicLockAddress,
        unlockAddress,
        udtAddress,
        wethAddress,
        estimatedGasForPurchase,
        locksmithURI,
        oracleAddress,
      },
      { ethers }
    ) => {
      const { chainId } = await ethers.provider.getNetwork()
      const networkName = networks[chainId].name

      // eslint-disable-next-line no-console
      console.log(`Connecting to ${networkName}...`)

      run('set:template', {
        publicLockAddress,
        unlockAddress,
      })

      run('set:unlock-config', {
        unlockAddress,
        udtAddress,
        wethAddress,
        estimatedGasForPurchase,
        locksmithURI,
      })

      run('set:unlock-oracle', {
        unlockAddress,
        udtAddress,
        oracleAddress,
      })
    }
  )

task('set:unlock-config', 'Configure Unlock contract')
  .addOptionalParam(
    'unlockAddress',
    'the address of an existing Unlock contract'
  )
  .addOptionalParam(
    'publicLockAddress',
    'the address of an existing public Lock contract'
  )
  .addOptionalParam('udtAddress', 'the address of an existing UDT contract')
  .addOptionalParam('wethAddress', 'the address of the WETH token contract')
  .addOptionalParam('estimatedGasForPurchase', 'gas estimate for buying a key')
  .addOptionalParam('locksmithURI', 'the locksmith URL to use in Unlock config')
  .setAction(
    async ({
      unlockAddress,
      udtAddress,
      wethAddress,
      estimatedGasForPurchase,
      locksmithURI,
    }) => {
      // eslint-disable-next-line global-require
      const unlockConfigSetter = require('../scripts/setters/unlock-config')
      await unlockConfigSetter({
        unlockAddress,
        udtAddress,
        wethAddress,
        estimatedGasForPurchase,
        locksmithURI,
      })
    }
  )

task('set:unlock-oracle', 'Set ERC20 <> WETH oracle address in Unlock contract')
  .addParam('tokenAddress', 'the address of an existing UDT contract')
  .addOptionalParam(
    'unlockAddress',
    'the address of an existing Unlock contract'
  )
  .addOptionalParam(
    'oracleAddress',
    'the address of the Uniswap Oracle contract'
  )
  .setAction(async ({ unlockAddress, tokenAddress, oracleAddress }) => {
    // eslint-disable-next-line global-require
    const unlockOracleSetter = require('../scripts/setters/unlock-oracle')
    await unlockOracleSetter({
      unlockAddress,
      tokenAddress,
      oracleAddress,
    })
  })

task('set:template', 'Set PublicLock address in Unlock contract')
  .addParam(
    'publicLockAddress',
    'the address of an existing public Lock contract'
  )
  .addOptionalParam(
    'unlockAddress',
    'the address of an existing Unlock contract'
  )
  .addOptionalParam('unlockVersion', 'the version of Unlock to deploy')
  .setAction(async ({ publicLockAddress, unlockAddress, unlockVersion }) => {
    // eslint-disable-next-line global-require
    const templateSetter = require('../scripts/setters/set-template')
    await templateSetter({
      publicLockAddress,
      unlockAddress,
      unlockVersion,
    })
  })

task('ownership:transfer', 'transfer the contract ownership to a new owner')
  .addParam('contractAddress', 'the address of the ownable contract')
  .addOptionalParam(
    'newOwner',
    'the address of the new owner (default to the team multisig)'
  )
  .setAction(async ({ newOwner, contractAddress }) => {
    const transferOwnership = require('../scripts/setters/transferOwnership')
    await transferOwnership({ contractAddress, newOwner })
  })

task('block:increase', 'Increase blocks')
  .addParam('n', 'number of blocks')
  .setAction(async ({ n }, { ethers }) => {
    const params = [
      ethers.toQuantity(BigInt(n)), // hex encoded number of blocks to increase
    ]
    await ethers.provider.send('evm_increaseBlocks', params)
    console.log(`> advancing ${n} blocks`)
  })

task('time:increase', 'Increase blocks')
  .addParam('n', 'number of minutes')
  .setAction(async ({ n }, { ethers }) => {
    const params = [ethers.toQuantity(BigInt(n * 60))]
    await ethers.provider.send('evm_increaseTime', params)
    console.log(`> advancing ${n * 60} minutes`)
  })
