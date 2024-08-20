const { upgrades, ethers } = require('hardhat')
const { Unlock, PublicLock } = require('@unlock-protocol/contracts')
const assert = require('assert')

const {
  lockFixtures: Locks,
  ADDRESS_ZERO,
  getEvent,
  getLock,
  deployUpgradeableContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

const deployLock = require('../../../scripts/deployments/lock')

const getDeployArgs = async ({ name }) => {
  const [, , manager] = await ethers.getSigners()
  const deployArgs = {
    owner: await manager.getAddress(),
    duration: Locks[name].expirationDuration,
    tokenAddress: ADDRESS_ZERO,
    price: Locks[name].keyPrice.toString(),
    maxNumberOfKeys: Locks[name].maxNumberOfKeys,
    name: Locks[name].lockName,
  }
  return deployArgs
}

const createLock = async ({ name, unlock, version = 14 }) => {
  const deployArgs = await getDeployArgs({ name })

  // encode initializer data
  const iface = new ethers.Interface(PublicLock.abi)
  const fragment = iface.getFunction(
    'initialize(address,uint256,address,uint256,uint256,string)'
  )
  const calldata = iface.encodeFunctionData(fragment, Object.values(deployArgs))

  // parse result
  const tx = await unlock.createUpgradeableLockAtVersion(calldata, version)
  const receipt = await tx.wait()
  const { args } = await getEvent(receipt, 'NewLock')

  return {
    name,
    deployArgs,
    lockAddress: args.newLockAddress,
  }
}

const fetchLock = async (lockAddress) => {
  const lock = await getLock(lockAddress)
  const methods = [
    'expirationDuration',
    'keyPrice',
    'maxNumberOfKeys',
    'freeTrialLength',
    'refundPenaltyBasisPoints',
    'transferFeeBasisPoints',
    'name',
    'symbol',
    'publicLockVersion',
    'tokenAddress',
    'numberOfOwners',
    'totalSupply',
  ]
  const results = {}
  await Promise.all(methods.map((method) => (results[method] = lock[method]())))

  return results
}

describe('Scripts/deploy:lock', () => {
  let unlockAddress
  const deployedLocks = {}

  before(async () => {
    const [unlockOwner] = await ethers.getSigners()

    // deploy unlock
    const [qualifiedPath] = await copyAndBuildContractsAtVersion(
      `${__dirname}/..`,
      [{ contractName: 'Unlock', version: 13 }]
    )
    ;({ address: unlockAddress } = await deployUpgradeableContract(
      qualifiedPath,
      [await unlockOwner.getAddress()],
      {
        initializer: 'initialize(address)',
      }
    ))
    const unlock = await ethers.getContractAt(Unlock.abi, unlockAddress)

    // deploy template
    const PublicLockFactory = await ethers.getContractFactory(
      PublicLock.abi,
      PublicLock.bytecode
    )
    const publicLock = await PublicLockFactory.deploy()

    // set unlock
    await unlock.addLockTemplate(
      await publicLock.getAddress(),
      await publicLock.publicLockVersion()
    )
    await unlock.setLockTemplate(await publicLock.getAddress())

    // deploy locks using local script
    await Promise.all(
      Object.keys(Locks)
        // .filter((name) => name != 'NON_EXPIRING') // avoid max 100yrs revert
        .map(async (name) => {
          deployedLocks[name] = await createLock({ name, unlock })
        })
    )
  })

  it('identical initial settings after deployment', async () => {
    Object.keys(deployedLocks).forEach(async (name) => {
      const deployArgs = getDeployArgs({ name })

      // make sure init are the same
      assert.equal(deployArgs, deployedLocks[name].deployArgs)

      // redeploy our lock
      const newLockAddress = await deployLock({
        unlockAddress,
        unlockVersion: 14,
        ...deployArgs,
      })

      // make sure values are identical
      assert.equal(
        await fetchLock(deployedLocks[name].lockAddress),
        await fetchLock(newLockAddress)
      )
    })
  })
})
