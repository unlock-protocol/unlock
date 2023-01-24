import { expect } from 'chai'
import { BigNumber, Contract } from 'ethers'
import { unlock, ethers } from 'hardhat'

import { lockParams } from './helpers/fixtures'
import * as subgraph from './helpers/subgraph'
import { purchaseKeys, purchaseKey } from './helpers/keys'

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
      expect(parseInt(lockInGraph.version)).to.equals(
        await lock.publicLockVersion()
      )

      expect(parseInt(lockInGraph.expirationDuration)).to.equals(
        lockParams.expirationDuration
      )
      expect(lockInGraph.name).to.equals(lockParams.name)
      // to be implemented in the graph yet...
      // expect(lockInGraph.maxNumberOfKeys).to.equals(lockParams.maxNumberOfKeys)

      // wait for a bit so events from the new lock are processed
      await awaitTimeout(2000)
      const lockInGraphAgain = await subgraph.getLock(lockAddress)

      expect(lockInGraphAgain.lockManagers).to.deep.equals([signer.address])
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

describe('key cancellation', function () {
  let lock: Contract
  let lockAddress: string
  let tokenIds: any
  let keyOwners: any

  before(async () => {
    await unlock.deployAndSetTemplate(11, 1)
    ;({ lock } = await unlock.createLock({ ...lockParams, version: 11 }))
    lockAddress = lock.address.toLowerCase()
    ;({ tokenIds, keyOwners } = await purchaseKeys(lockAddress, 3))
  })

  it('deletes item correctly from subgraph', async () => {
    await awaitTimeout(2000)
    const keyInGraph = await subgraph.getKey(lockAddress, tokenIds[1])
    expect(keyInGraph).to.not.be.null
    expect(keyInGraph.cancelled).to.be.null

    // cancel the 2nd one
    const keyOwner = await ethers.getSigner(keyOwners[1])
    await lock.connect(keyOwner).cancelAndRefund(tokenIds[1])
    expect(await lock.isValidKey(tokenIds[1])).to.be.false

    await awaitTimeout(2000)
    const keyInGraphAfterCancellation = await subgraph.getKey(
      lockAddress,
      tokenIds[1]
    )
    expect(keyInGraphAfterCancellation.cancelled).to.be.true
  })
})

describe('(v12) Lock config', function () {
  let lock: Contract
  let lockAddress: string
  before(async () => {
    ;({ lock } = await unlock.createLock({ ...lockParams }))
    lockAddress = lock.address.toLowerCase()
  })

  it('stores default values correctly', async () => {
    expect(await lock.expirationDuration()).to.equals(
      lockParams.expirationDuration
    )
    expect(await lock.maxNumberOfKeys()).to.equals(lockParams.maxNumberOfKeys)
    expect(await lock.maxKeysPerAddress()).to.equals(1)

    await awaitTimeout(2000)
    const lockInGraph = await subgraph.getLock(lockAddress)
    expect(parseInt(lockInGraph.expirationDuration)).to.equals(
      lockParams.expirationDuration
    )
    expect(parseInt(lockInGraph.maxNumberOfKeys)).to.equals(
      lockParams.maxNumberOfKeys
    )
    expect(parseInt(lockInGraph.maxKeysPerAddress)).to.equals(1)
  })

  it('stores new values correctly', async () => {
    const config = {
      expirationDuration: 100,
      maxNumberOfKeys: 50,
      maxKeysPerAddress: 10,
    }

    await lock.updateLockConfig(...Object.values(config))
    await awaitTimeout(2000)
    const lockInGraph = await subgraph.getLock(lockAddress)
    expect(parseInt(lockInGraph.expirationDuration)).to.equals(
      config.expirationDuration
    )
    expect(parseInt(lockInGraph.maxNumberOfKeys)).to.equals(
      config.maxNumberOfKeys
    )
    expect(parseInt(lockInGraph.maxKeysPerAddress)).to.equals(
      config.maxKeysPerAddress
    )
  })
})

describe('Keep track of changes in metadata', function () {
  let lock: Contract
  let unlockContract: Contract
  let lockAddress: string
  let lockInGraph: any
  let tokenIds: [BigNumber]

  before(async () => {
    ;({ lock } = await unlock.createLock({ ...lockParams }))
    lockAddress = lock.address.toLowerCase()
    unlockContract = await unlock.getUnlockContract()

    // purchase a bunch of keys
    ;({ tokenIds } = await purchaseKeys(lockAddress, 3))
  })
  describe('defaults', () => {
    before(async () => {
      await awaitTimeout(2000)
      lockInGraph = await subgraph.getLock(lockAddress)
    })
    it('name is correct ', async () => {
      expect(lockInGraph.name).to.equals(lockParams.name)
    })
    it('symbol is correct ', async () => {
      expect(lockInGraph.symbol).to.equals(
        await unlockContract.globalTokenSymbol()
      )
    })
    it('tokenURIs are correct ', async () => {
      // default tokenURI before config
      const baseTokenURI = `${await unlockContract.globalBaseTokenURI()}${lock.address.toLowerCase()}/`
      expect(await lock.tokenURI(0)).to.equals(baseTokenURI)

      // lockInGraph
      expect(lockInGraph.totalKeys).to.equals('3')
      for (let i = 0; i < lockInGraph.totalKeys; i++) {
        const keyInGraph = await subgraph.getKey(lockAddress, tokenIds[i])
        expect(await lock.tokenURI(tokenIds[i])).to.equals(keyInGraph.tokenURI)
      }
    })
  })

  describe('when metadata changes', () => {
    const metadata = {
      name: 'Lock Metadata',
      symbol: 'METAKEY',
      baseTokenURI: 'https:/custom-lock.com/api/key/',
    }

    before(async () => {
      await lock.setLockMetadata(...Object.values(metadata))
      await awaitTimeout(2000)
      lockInGraph = await subgraph.getLock(lockAddress)
    })
    it('set correctly', async () => {
      expect(lockInGraph.name).to.equals(metadata.name)
      expect(lockInGraph.symbol).to.equals(metadata.symbol)
      for (let i = 0; i < lockInGraph.totalKeys; i++) {
        const keyInGraph = await subgraph.getKey(lockAddress, tokenIds[i])
        expect(await lock.tokenURI(tokenIds[i])).to.equals(
          `${keyInGraph.tokenURI}`
        )
      }
    })
  })
})

describe('Receipts', function () {
  let lock: Contract
  let unlockContract: Contract
  let lockAddress: string

  describe('Receipts', function () {
    let lock: Contract
    let lockAddress: string
    let tokenId: BigNumber
    let transactionHash: string
    let receiptInGraph: any

    before(async () => {
      ;({ lock } = await unlock.createLock({ ...lockParams }))
      lockAddress = lock.address.toLowerCase()
      unlockContract = await unlock.getUnlockContract()

      // purchase a key
      const [keyOwner] = await ethers.getSigners()
      ;({ tokenId, transactionHash } = await purchaseKey(
        lockAddress,
        keyOwner.address
      ))
      await awaitTimeout(2000)
      receiptInGraph = await subgraph.getReceipt(transactionHash)
    })

    it('created the receipt successfully', async () => {
      expect(receiptInGraph.tokenAddress).to.equals(await lock.tokenAddress())
      expect(receiptInGraph.lockAddress.toLocaleLowerCase()).to.equals(
        await lock.address.toLocaleLowerCase()
      )
    })
  })
})
