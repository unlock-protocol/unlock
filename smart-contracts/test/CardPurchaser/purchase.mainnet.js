const { ethers } = require('hardhat')
const assert = require('assert')
const {
  deployLock,
  getUnlockAddress,
  reverts,
  addSomeETH,
  addSomeUSDC,
} = require('../helpers')

const USDC_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/USDC.json')
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

const keyPrice = ethers.parseUnits('5', 6)

/**
 * Function that prepares a purchase
 * @param {*} lock
 * @param {*} recipient
 * @returns
 */
const purchaseCallData = async (lock, recipient) => {
  const args = [
    [await lock.keyPrice()], // keyPrices
    [recipient], // recipients
    [recipient], // key manager
    [recipient], // referrers
    ['0x'], // _data
  ]
  return lock.interface.encodeFunctionData('purchase', args)
}

// Create the transferWithAuthorization signature
const signUSDCTransfer = async ({
  from,
  chainId,
  signer,
  recipient,
  amount,
}) => {
  const usdcContract = new ethers.Contract(USDC, USDC_ABI, signer)

  const domain = {
    name: await usdcContract.name(),
    version: await usdcContract.version(),
    chainId,
    verifyingContract: await usdcContract.getAddress(),
  }
  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  }

  const message = {
    from: from ? from : ethers.getAddress(await signer.getAddress()),
    to: ethers.getAddress(recipient), // Receiver wallet
    value: amount,
    validAfter: 0,
    validBefore: Math.floor(Date.now() / 1000) + 3600, // Valid for an hour
    nonce: ethers.hexlify(ethers.randomBytes(32)), // 32 byte hex string
  }

  const signature = await signer.signTypedData(domain, types, message)
  return { signature, message }
}

// Sign the transfer
const signLockPurchase = async ({
  chainId,
  signer,
  cardPurchaser,
  lockAddress,
  expiration,
  sender,
}) => {
  const domain = {
    name: await cardPurchaser.name(),
    version: await cardPurchaser.version(),
    chainId,
    verifyingContract: await cardPurchaser.getAddress(),
  }

  const types = {
    Purchase: [
      { name: 'lock', type: 'address' },
      { name: 'sender', type: 'address' },
      { name: 'expiration', type: 'uint256' },
    ],
  }

  const now = Math.floor(new Date().getTime() / 1000)

  const message = {
    sender: sender ? sender : await signer.getAddress(),
    lock: lockAddress,
    expiration: expiration ? expiration : now + 60 * 60 * 24, // 1 hour!
  }

  const signature = await signer.signTypedData(domain, types, message)
  return { signature, message, domain, types }
}

describe(`CardPurchaser / purchase (mainnet only)`, function () {
  let chainId, unlock, cardPurchaser, signer, lock, unlockAddress
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }
    ;[signer] = await ethers.getSigners()

    await addSomeETH(await signer.getAddress())

    // get Unlock contract
    unlockAddress = await getUnlockAddress()
    unlock = await ethers.getContractAt('Unlock', unlockAddress)

    // deploy CardPurchaser
    const UnlockCardPurchaser = await ethers.getContractFactory('CardPurchaser')
    cardPurchaser = await UnlockCardPurchaser.deploy(
      await signer.getAddress(),
      unlockAddress,
      USDC
    )

    lock = await deployLock({
      unlock,
      tokenAddress: USDC,
      keyPrice,
      isEthers: true,
    })

    chainId = (await ethers.provider.getNetwork()).chainId
  })

  it('should be owned by the right address when deployed', async () => {
    assert.equal(await cardPurchaser.owner(), await signer.getAddress())
  })

  it('should have the right values', async () => {
    assert.equal(await cardPurchaser.unlockAddress(), unlockAddress)
    assert.equal(await cardPurchaser.usdc(), USDC)
    assert.equal(await cardPurchaser.name(), 'Card Purchaser')
    assert.equal(await cardPurchaser.version(), '1')
  })

  it('should fail if called for a non existing lock', async () => {
    const notALock = ethers.id('NOT A LOCK').slice(0, 42)
    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await cardPurchaser.getAddress(),
      amount: keyPrice,
    })
    const purchase = await signLockPurchase({
      chainId,
      signer,
      cardPurchaser,
      lockAddress: notALock,
    })

    await reverts(
      cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      ),
      'MISSING_LOCK()'
    )
  })

  it('should fail if called after the expiration', async () => {
    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await cardPurchaser.getAddress(),
      amount: keyPrice,
    })
    const purchase = await signLockPurchase({
      chainId,
      signer,
      cardPurchaser,
      lockAddress: await lock.getAddress(),
      expiration: Math.floor(new Date().getTime() / 1000) - 60 * 15, // 15 minutes ago
    })

    await reverts(
      cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      ),
      'TOO_LATE()'
    )
  })

  it('should fail if the payer is not the sender', async () => {
    const notSender = new ethers.Wallet.createRandom()
    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await cardPurchaser.getAddress(),
      amount: keyPrice,
    })
    const purchase = await signLockPurchase({
      chainId,
      signer: notSender,
      cardPurchaser,
      lockAddress: await lock.getAddress(),
    })
    await reverts(
      cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      ),
      'PURCHASER_DOES_NOT_MATCH_PAYER()'
    )
  })

  it('should fail if the signature of the purchaseMessage does not match', async () => {
    const notSigner = new ethers.Wallet.createRandom()
    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await cardPurchaser.getAddress(),
      amount: keyPrice,
    })
    const purchase = await signLockPurchase({
      chainId,
      signer: notSigner,
      sender: await signer.getAddress(),
      cardPurchaser,
      lockAddress: await lock.getAddress(),
    })
    await reverts(
      cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      ),
      'SIGNER_DOES_NOT_MATCH()'
    )
  })

  it('should fail if the transfer of tokens fails because the user does not have enough USDC', async () => {
    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await cardPurchaser.getAddress(),
      amount: keyPrice,
    })
    const purchase = await signLockPurchase({
      chainId,
      signer,
      cardPurchaser,
      lockAddress: await lock.getAddress(),
    })

    await reverts(
      cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      ),
      'ERC20: transfer amount exceeds balance'
    )
  })

  it('should fail if the transfer of tokens fails because the recipient is not correct!', async () => {
    await addSomeUSDC(USDC, await signer.getAddress(), keyPrice)
    const notCardPurchaser = new ethers.Wallet.createRandom()

    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await notCardPurchaser.getAddress(),
      amount: keyPrice,
    })
    const purchase = await signLockPurchase({
      chainId,
      signer,
      cardPurchaser,
      lockAddress: await lock.getAddress(),
    })

    await reverts(
      cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      ),
      'FiatTokenV2: invalid signature'
    )
  })

  it('should fail if the amount of approved tokens is not enough to cover the purchase', async () => {
    await addSomeUSDC(USDC, await signer.getAddress(), keyPrice)
    await addSomeUSDC(USDC, await cardPurchaser.getAddress(), keyPrice) // In theory the Card Purchaser contract has enough funds!

    // Signer approves the CardPurchaser to spend 3 USDC
    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await cardPurchaser.getAddress(),
      amount: ethers.parseUnits('3', 6),
    })
    const purchase = await signLockPurchase({
      chainId,
      signer,
      cardPurchaser,
      lockAddress: await lock.getAddress(),
    })

    await reverts(
      cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      ),
      'ERC20: transfer amount exceeds allowance'
    )
  })

  it('should succeed with a purchase', async () => {
    await addSomeUSDC(
      USDC,
      await signer.getAddress(),
      ethers.parseUnits('6', 6)
    )
    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await cardPurchaser.getAddress(),
      amount: ethers.parseUnits('6', 6),
    })
    const purchase = await signLockPurchase({
      chainId,
      signer,
      cardPurchaser,
      lockAddress: await lock.getAddress(),
    })

    // Balance of USDC has increased (fees collected by Unlock!)
    const usdcContract = new ethers.Contract(USDC, USDC_ABI, signer)
    const balanceBefore = await usdcContract.balanceOf(
      await cardPurchaser.getAddress()
    )
    assert.equal(await lock.balanceOf(await signer.getAddress()), 0)
    await (
      await cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      )
    ).wait()
    assert.equal(await lock.balanceOf(await signer.getAddress()), 1)

    assert.equal(
      await usdcContract.balanceOf(await cardPurchaser.getAddress()),
      balanceBefore + ethers.parseUnits('1', 6)
    )
  })

  it('should reset the approval to 0', async () => {
    await addSomeUSDC(USDC, await signer.getAddress(), keyPrice)
    const transfer = await signUSDCTransfer({
      chainId,
      signer,
      recipient: await cardPurchaser.getAddress(),
      amount: keyPrice,
    })
    const purchase = await signLockPurchase({
      chainId,
      signer,
      cardPurchaser,
      lockAddress: await lock.getAddress(),
    })
    const usdcContract = new ethers.Contract(USDC, USDC_ABI, signer)
    await (
      await cardPurchaser.purchase(
        transfer.message,
        transfer.signature,
        purchase.message,
        purchase.signature,
        await purchaseCallData(lock, await signer.getAddress())
      )
    ).wait()
    assert.equal(
      await usdcContract.allowance(
        await cardPurchaser.getAddress(),
        await lock.getAddress()
      ),
      0
    )
  })
})
