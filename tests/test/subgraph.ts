import { expect } from 'chai'
import { BigNumber, Contract } from 'ethers'
import { unlock, ethers } from 'hardhat'

import { lockParams } from './helpers/fixtures'
import * as subgraph from './helpers/subgraph'
import { purchaseKeys } from './helpers/keys'

const awaitTimeout = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay))

describe('Unlock', function () {
  describe('Create a simple lock', function () {
    let lock: Contract
    before(async () => {
      ;({ lock } = await unlock.createLock({ ...lockParams }))
    })
    it('deploy with the correct parameters', async () => {
      expect(await lock.keyPrice()).to.equals(lockParams.keyPrice)
      expect(await lock.tokenAddress()).to.equals(
        lockParams.currencyContractAddress
      )
      expect(await lock.expirationDuration()).to.equals(
        lockParams.expirationDuration
      )
      expect(await lock.maxNumberOfKeys()).to.equals(lockParams.maxNumberOfKeys)
      expect(await lock.name()).to.equals(lockParams.name)
    })
    it('subgraph store info correctly', async () => {
      // wait 2 sec for subgraph to index
      await awaitTimeout(2000)
      const [signer] = await ethers.getSigners()

      const lockAddress = lock.address.toLowerCase()

      const lockInGraph = await subgraph.getLock(lockAddress)

      expect(lockInGraph.id).to.equals(lockAddress)
      expect(lockInGraph.address).to.equals(lockAddress)
      expect(lockInGraph.price).to.equals(lockParams.keyPrice.toString())
      expect(lockInGraph.tokenAddress).to.equals(
        lockParams.currencyContractAddress
      )
      expect(lockInGraph.lockManagers).to.deep.equals([signer.address])
      expect(parseInt(lockInGraph.version)).to.equals(
        await lock.publicLockVersion()
      )

      expect(parseInt(lockInGraph.expirationDuration)).to.equals(
        lockParams.expirationDuration
      )
      expect(lockInGraph.name).to.equals(lockParams.name)
      // to be implemented in the graph yet...
      // expect(lockInGraph.maxNumberOfKeys).to.equals(lockParams.maxNumberOfKeys)
    })
  })
})

describe('Keep track of total keys', function () {
  let lock: Contract
  let lockAddress: string
  before(async () => {
    ;({ lock } = await unlock.createLock({ ...lockParams }))
    lockAddress = lock.address.toLowerCase()
  })
  describe('totalKeys', () => {
    it('default to zero ', async () => {
      await awaitTimeout(2000)
      const lockInGraph = await subgraph.getLock(lockAddress)
      expect(parseInt(lockInGraph.totalKeys)).to.equals(0)
    })
    describe('increase/decrease', () => {
      let tokenIds: [BigNumber]
      let keyOwners: [string]
      before(async () => {
        ;({ tokenIds, keyOwners } = await purchaseKeys(lockAddress, 3))
        await awaitTimeout(2000)
      })
      it('increase by the number of keys purchased', async () => {
        const lockInGraph = await subgraph.getLock(lockAddress)
        expect(parseInt(lockInGraph.totalKeys)).to.equals(3)
      })
      it('decrease when keys are burnt', async () => {
        const keyOwner = await ethers.getSigner(keyOwners[0])
        await lock.connect(keyOwner).burn(tokenIds[0])
        await awaitTimeout(2000)
        const lockInGraph = await subgraph.getLock(lockAddress)
        expect(parseInt(lockInGraph.totalKeys)).to.equals(2)
      })
    })
  })
})

describe('Upgrade a lock', function () {
  let lock: Contract
  let unlockContract: Contract
  let latestVersion: number

  before(async () => {
    unlockContract = await unlock.getUnlockContract()
    latestVersion = await unlockContract.publicLockLatestVersion()

    // deploy a previous version
    await unlock.deployAndSetTemplate(latestVersion - 1, 1)

    // create a lock with an older version
    ;({ lock } = await unlock.createLock({
      ...lockParams,
      version: latestVersion - 1,
    }))
    expect(await unlock.getLockVersion(lock.address)).to.equals(
      latestVersion - 1
    )
  })
  it('subgraph update lock info correctly after upgrade', async () => {
    const lockAddress = lock.address.toLowerCase()
    await awaitTimeout(2000)
    const lockInGraph = await subgraph.getLock(lockAddress)
    expect(parseInt(lockInGraph.version)).to.equals(latestVersion - 1)

    // upgrade the lock
    await unlockContract.upgradeLock(lockAddress, latestVersion)
    await awaitTimeout(5000)

    // make sure we upgraded version
    const lockInGraphAfterUpgrade = await subgraph.getLock(lockAddress)
    expect(parseInt(lockInGraphAfterUpgrade.version)).to.equals(latestVersion)
  })
})
