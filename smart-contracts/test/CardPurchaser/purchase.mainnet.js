const { ethers } = require('hardhat')
const { expect } = require('chai')
const {
  deployLock,
  UNLOCK_ADDRESS,
  reverts,
  addSomeETH,
  addSomeUSDC,
} = require('../helpers')


const USDC_ABI = require('../helpers/ABIs/USDC.json')
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

const keyPrice = ethers.utils.parseUnits('5', 6)

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
    [[]], // _data
  ]
  return lock.interface.encodeFunctionData('purchase', args)
}

// Create the transferWithAuthorization signature
const signUSDCTransfer = async ({ from, chainId, signer, recipient, amount }) => {
  const usdcContract = new ethers.Contract(USDC, USDC_ABI, signer);

  const domain = {
    name: await usdcContract.name(),
    version: await usdcContract.version(),
    chainId,
    verifyingContract: usdcContract.address
  };
  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };

  const message = {
    from: from ? from : ethers.utils.getAddress(signer.address),
    to: ethers.utils.getAddress(recipient), // Receiver wallet
    value: amount,
    validAfter: 0,
    validBefore: Math.floor(Date.now() / 1000) + 3600, // Valid for an hour
    nonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)), // 32 byte hex string
  };

  const signature = await signer._signTypedData(domain, types, message);
  return { signature, message }
}

// Sign the transfer
const signLockPurchase = async ({ chainId, signer, cardPurchaser, lockAddress, expiration, sender }) => {
  const domain = {
    name: await cardPurchaser.name(),
    version: await cardPurchaser.version(),
    chainId,
    verifyingContract: cardPurchaser.address,
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
    sender: sender ? sender : signer.address,
    lock: lockAddress,
    expiration: expiration ? expiration : now + 60 * 60 * 24, // 1 hour!
  }

  const signature = await signer._signTypedData(domain, types, message)
  return { signature, message, domain, types }
}


describe(`purchase`, function () {

  let chainId, unlock, cardPurchaser, signer, lock
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }
    [signer] = await ethers.getSigners()

    await addSomeETH(signer.address)

    // get Unlock contract
    unlock = await ethers.getContractAt('Unlock', UNLOCK_ADDRESS)

    // deploy CardPurchaser
    const UnlockSwapPurchaser = await ethers.getContractFactory('CardPurchaser')
    cardPurchaser = await UnlockSwapPurchaser.deploy(
      signer.address,
      UNLOCK_ADDRESS,
      USDC
    )

    lock = await deployLock({ unlock, tokenAddress: USDC, keyPrice, isEthers: true })

    chainId = (await ethers.provider.getNetwork()).chainId
  })

  it('should be owned by the right address when deployed', async () => {
    expect(await cardPurchaser.owner()).to.equal(signer.address)
  })

  it('should have the right values', async () => {
    expect(await cardPurchaser.unlockAddress()).to.equal(UNLOCK_ADDRESS)
    expect(await cardPurchaser.usdc()).to.equal(USDC)
    expect(await cardPurchaser.name()).to.equal('Card Purchaser')
    expect(await cardPurchaser.version()).to.equal('1')
  })



  it('should fail if called for a non existing lock', async () => {
    const notALock = ethers.utils.id('NOT A LOCK').slice(0, 42)
    const transfer = await signUSDCTransfer({ chainId, signer, recipient: cardPurchaser.address, amount: keyPrice })
    const purchase = await signLockPurchase({ chainId, signer, cardPurchaser, lockAddress: notALock })

    await reverts(
      cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address)),
      'MISSING_LOCK()'
    )
  })

  it('should fail if called after the expiration', async () => {
    const transfer = await signUSDCTransfer({ chainId, signer, recipient: cardPurchaser.address, amount: keyPrice })
    const purchase = await signLockPurchase({
      chainId, signer, cardPurchaser, lockAddress: lock.address, expiration: Math.floor(new Date().getTime() / 1000) - 60 * 15 // 15 minutes ago
    })

    await reverts(
      cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address)),
      'TOO_LATE()'
    )
  })

  it('should fail if the payer is not the sender', async () => {
    const notSender = new ethers.Wallet.createRandom()
    const transfer = await signUSDCTransfer({ chainId, signer, recipient: cardPurchaser.address, amount: keyPrice })
    const purchase = await signLockPurchase({
      chainId,
      signer: notSender,
      cardPurchaser,
      lockAddress: lock.address
    })
    await reverts(
      cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address)),
      'PURCHASER_DOES_NOT_MATCH_PAYER()'
    )
  })

  it('should fail if the signature of the purchaseMessage does not match', async () => {
    const notSigner = new ethers.Wallet.createRandom()
    const transfer = await signUSDCTransfer({ chainId, signer, recipient: cardPurchaser.address, amount: keyPrice })
    const purchase = await signLockPurchase({
      chainId,
      signer: notSigner,
      sender: signer.address,
      cardPurchaser,
      lockAddress: lock.address
    })
    await reverts(
      cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address)),
      'SIGNER_DOES_NOT_MATCH()'
    )
  })

  it('should fail if the transfer of tokens fails because the user does not have enough USDC', async () => {
    const transfer = await signUSDCTransfer({ chainId, signer, recipient: cardPurchaser.address, amount: keyPrice })
    const purchase = await signLockPurchase({ chainId, signer, cardPurchaser, lockAddress: lock.address })

    await reverts(
      cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address)),
      'ERC20: transfer amount exceeds balance'
    )
  })

  it('should fail if the transfer of tokens fails because the recipient is not correct!', async () => {
    await addSomeUSDC(USDC, signer.address, keyPrice)
    const notCardPurchaser = new ethers.Wallet.createRandom()

    const transfer = await signUSDCTransfer({ chainId, signer, recipient: notCardPurchaser.address, amount: keyPrice })
    const purchase = await signLockPurchase({ chainId, signer, cardPurchaser, lockAddress: lock.address })

    await reverts(
      cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address)),
      'FiatTokenV2: invalid signature'
    )
  })

  it('should fail if the amount of approved tokens is not enough to cover the purchase', async () => {
    await addSomeUSDC(USDC, signer.address, keyPrice)
    await addSomeUSDC(USDC, cardPurchaser.address, keyPrice) // In theory the Card Purchaser contract has enough funds!

    // Signer approves the CardPurchaser to spend 3 USDC
    const transfer = await signUSDCTransfer({ chainId, signer, recipient: cardPurchaser.address, amount: ethers.utils.parseUnits('3', 6) })
    const purchase = await signLockPurchase({ chainId, signer, cardPurchaser, lockAddress: lock.address })

    await reverts(
      cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address)),
      'ERC20: transfer amount exceeds allowance'
    )
  })

  it('should succeed with a purchase', async () => {
    await addSomeUSDC(USDC, signer.address, ethers.utils.parseUnits('6', 6))
    const transfer = await signUSDCTransfer({ chainId, signer, recipient: cardPurchaser.address, amount: ethers.utils.parseUnits('6', 6) })
    const purchase = await signLockPurchase({ chainId, signer, cardPurchaser, lockAddress: lock.address })

    // Balance of USDC has increased (fees collected by Unlock!)
    const usdcContract = new ethers.Contract(USDC, USDC_ABI, signer);
    const balanceBefore = (await usdcContract.balanceOf(cardPurchaser.address))
    expect((await lock.balanceOf(signer.address)).toNumber()).to.equal(0)
    await (await cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address))).wait()
    expect((await lock.balanceOf(signer.address)).toNumber()).to.equal(1)

    expect((await usdcContract.balanceOf(cardPurchaser.address)).toNumber()).to.equal(balanceBefore.add(ethers.utils.parseUnits('1', 6)).toNumber())
  })

  it('should reset the approval to 0', async () => {
    await addSomeUSDC(USDC, signer.address, keyPrice)
    const transfer = await signUSDCTransfer({ chainId, signer, recipient: cardPurchaser.address, amount: keyPrice })
    const purchase = await signLockPurchase({ chainId, signer, cardPurchaser, lockAddress: lock.address })
    const usdcContract = new ethers.Contract(USDC, USDC_ABI, signer);
    await (await cardPurchaser.purchase(transfer.message, transfer.signature, purchase.message, purchase.signature, await purchaseCallData(lock, signer.address))).wait()
    expect((await usdcContract.allowance(cardPurchaser.address, lock.address)).toNumber()).to.equal(0)

  })
})
