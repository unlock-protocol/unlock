import * as subgraph from './helpers/subgraph'

import { Contract, getAddress } from 'ethers'
import { ethers, unlock } from 'hardhat'
import { purchaseKey, purchaseKeys } from './helpers/keys'

import ERC20ABI from './helpers/ERC20.abi.json'
import { expect } from 'chai'
import { lockParams } from './helpers/fixtures'

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
      await awaitTimeout(3000)
      const [signer] = await ethers.getSigners()

      const lockAddress = await lock.getAddress()

      const lockInGraph = await subgraph.getLock(lockAddress)

      expect(lockInGraph.id).to.equals(lockAddress.toLowerCase())
      expect(getAddress(lockInGraph.address)).to.equals(getAddress(lockAddress))
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
      await awaitTimeout(3000)
      const lockInGraphAgain = await subgraph.getLock(lockAddress)

      expect(lockInGraphAgain.lockManagers).to.deep.equals([
        await signer.getAddress(),
      ])
    })
  })
})

describe('Keep track of total keys', function () {
  let lock: Contract
  let lockAddress: string
  before(async () => {
    ;({ lock } = await unlock.createLock({ ...lockParams }))
    lockAddress = await lock.getAddress()
  })
  describe('totalKeys', () => {
    it('default to zero ', async () => {
      await awaitTimeout(3000)
      const lockInGraph = await subgraph.getLock(lockAddress)
      expect(parseInt(lockInGraph.totalKeys)).to.equals(0)
    })
    describe('increase/decrease', () => {
      let tokenIds: [bigint]
      let keyOwners: [string]
      before(async () => {
        ;({ tokenIds, keyOwners } = await purchaseKeys(lockAddress, 3))
        await awaitTimeout(3000)
      })
      it('increase by the number of keys purchased', async () => {
        const lockInGraph = await subgraph.getLock(lockAddress)
        expect(parseInt(lockInGraph.totalKeys)).to.equals(3)
      })
      it('decrease when keys are burnt', async () => {
        const keyOwner = await ethers.getSigner(keyOwners[0])
        await lock.connect(keyOwner).getFunction('burn')(tokenIds[0])
        await awaitTimeout(3000)
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
  let prevVersion: number

  before(async () => {
    unlockContract = await unlock.getUnlockContract()
    latestVersion = await unlockContract.publicLockLatestVersion()
    prevVersion = parseInt(latestVersion.toString()) - 1

    // deploy a previous version
    await unlock.deployAndSetTemplate(prevVersion, 1)

    // create a lock with an older version
    ;({ lock } = await unlock.createLock({
      ...lockParams,
      version: prevVersion,
    }))
    expect(await unlock.getLockVersion(await lock.getAddress())).to.equals(
      prevVersion
    )
  })
  it('subgraph update lock info correctly after upgrade', async () => {
    const lockAddress = await lock.getAddress()
    await awaitTimeout(3000)
    const lockInGraph = await subgraph.getLock(lockAddress)
    expect(parseInt(lockInGraph.version)).to.equals(prevVersion)

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
    lockAddress = await lock.getAddress()
    ;({ tokenIds, keyOwners } = await purchaseKeys(lockAddress, 3))
  })

  it('deletes item correctly from subgraph', async () => {
    await awaitTimeout(3000)
    const keyInGraph = await subgraph.getKey(lockAddress, tokenIds[1])
    expect(keyInGraph).to.not.equal(null)
    expect(keyInGraph.cancelled).to.equal(false)

    // cancel the 2nd one
    const keyOwner = await ethers.getSigner(keyOwners[1])
    await lock.connect(keyOwner).getFunction('cancelAndRefund')(tokenIds[1])
    expect(await lock.isValidKey(tokenIds[1])).to.equal(false)

    await awaitTimeout(3000)
    const keyInGraphAfterCancellation = await subgraph.getKey(
      lockAddress,
      tokenIds[1]
    )
    expect(keyInGraphAfterCancellation.cancelled).to.equal(true)
  })
})

describe('(v12) Lock config', function () {
  let lock: Contract
  let lockAddress: string
  before(async () => {
    ;({ lock } = await unlock.createLock({ ...lockParams }))
    lockAddress = await lock.getAddress()
  })

  it('stores default values correctly', async () => {
    expect(await lock.expirationDuration()).to.equals(
      lockParams.expirationDuration
    )
    expect(await lock.maxNumberOfKeys()).to.equals(lockParams.maxNumberOfKeys)
    expect(await lock.maxKeysPerAddress()).to.equals(1)

    await awaitTimeout(3000)
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
    await awaitTimeout(3000)
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
  let tokenIds: [bigint]

  before(async () => {
    ;({ lock } = await unlock.createLock({ ...lockParams }))
    lockAddress = await lock.getAddress()
    unlockContract = await unlock.getUnlockContract()

    // purchase a bunch of keys
    ;({ tokenIds } = await purchaseKeys(lockAddress, 3))
    await awaitTimeout(3000)
  })
  describe('defaults', () => {
    before(async () => {
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
      const baseTokenURI = `${await unlockContract.globalBaseTokenURI()}${(
        await lock.getAddress()
      ).toLowerCase()}/`
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
      await awaitTimeout(3000)
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
  it('created the receipt successfully for a native currency lock', async () => {
    const [{ address: lockAddress }, ,] = await subgraph.getLocks(1)
    const lock = await unlock.getLockContract(lockAddress)

    // purchase a key
    const [payer] = await ethers.getSigners()
    const { transactionHash } = await purchaseKey(
      lockAddress,
      await ethers.Wallet.createRandom().getAddress()
    )
    // wait for subgraph to index
    await awaitTimeout(3000)
    const receiptInGraph = await subgraph.getReceipt(transactionHash)

    expect(receiptInGraph.tokenAddress).to.equals(await lock.tokenAddress())
    expect(receiptInGraph.lockAddress.toLocaleLowerCase()).to.equals(
      (await lock.getAddress()).toLocaleLowerCase()
    )
    expect(receiptInGraph.sender).to.equal(payer.address.toLocaleLowerCase())
    expect(receiptInGraph.payer).to.equal(payer.address.toLocaleLowerCase())
    expect(receiptInGraph.amountTransferred).to.equal(await lock.keyPrice()) // assuming price paid was keyPrice
    expect(parseInt(receiptInGraph.gasTotal, 10)).to.greaterThan(0)
  })

  it('created the receipt successfully for an ERC20 currency lock', async () => {
    const [{ address: lockAddress }, ,] = await subgraph.getLocks(1, true)
    const lock = await unlock.getLockContract(lockAddress)

    // purchase a key
    const [payer] = await ethers.getSigners()

    // Check the balance!
    const erc20 = new ethers.Contract(
      await lock.tokenAddress(),
      ERC20ABI,
      payer
    )
    // Approve ERC20
    await erc20.approve(lockAddress, ethers.MaxUint256)
    const { transactionHash } = await purchaseKey(
      lockAddress,
      ethers.Wallet.createRandom().address // buying for someone else!
    )
    // wait for subgraph to index
    await awaitTimeout(3000)
    const receiptInGraph = await subgraph.getReceipt(transactionHash)

    expect(receiptInGraph.tokenAddress.toLocaleLowerCase()).to.equals(
      (await lock.tokenAddress()).toLocaleLowerCase()
    )
    expect(receiptInGraph.lockAddress.toLocaleLowerCase()).to.equals(
      (await lock.getAddress()).toLocaleLowerCase()
    )
    expect(receiptInGraph.sender).to.equal(payer.address.toLocaleLowerCase())
    expect(receiptInGraph.payer).to.equal(payer.address.toLocaleLowerCase())
    expect(receiptInGraph.amountTransferred).to.equal(await lock.keyPrice()) // assuming price paid was keyPrice
    expect(parseInt(receiptInGraph.gasTotal, 10)).to.greaterThan(0)
  })
})
