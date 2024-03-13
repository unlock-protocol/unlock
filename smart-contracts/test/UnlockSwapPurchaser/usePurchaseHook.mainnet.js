const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  getSignatureForPassword,
  deployLock,
  compareBigNumbers,
  MAX_UINT,
} = require('../helpers')

const {
  ADDRESS_ZERO,
  addSomeETH,
  addERC20,
  getUnlock,
  getNetwork,
  PERMIT2_ADDRESS,
  getUniswapTokens,
  getUniswapRoute,
} = require('@unlock-protocol/hardhat-helpers')

let swapPurchaser, unlock, lock, tokenAddress

let owner, keyOwner
let native, usdc

// hooks params
const code = 'PROMO CODE'
const recipient = '0xF5C28ce24cf47849988f147d5C75787c0103534'.toLowerCase()
const discount = 3000 // basis points
const cap = 10

describe('UnlockSwapPurchaser / purchase with promo code', () => {
  before(async () => {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }
    ;[owner, keyOwner] = await ethers.getSigners()

    // fund deployer and keyOwner
    await addSomeETH(owner.address)
    await addSomeETH(keyOwner.address)

    const UnlockSwapPurchaser = await ethers.getContractFactory(
      'UnlockSwapPurchaser'
    )
    // use mainnet settings for testing purposes only
    const {
      unlockAddress,
      id: chainId,
      uniswapV3: { universalRouterAddress },
    } = await getNetwork(1)

    unlock = await getUnlock(unlockAddress)

    const routers = [
      universalRouterAddress,
      '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    ]

    swapPurchaser = await UnlockSwapPurchaser.deploy(
      unlock.address,
      PERMIT2_ADDRESS,
      routers
    )
      // get usdc token for testing
      ; ({ native, usdc } = await getUniswapTokens(chainId))
    tokenAddress = usdc.address

    // deploy hook
    const DiscountHook = await ethers.getContractFactory('DiscountHook')
    const hook = await DiscountHook.deploy()
    await hook.deployed()

    const [dataRecipient, signerAddress] = await getSignatureForPassword(
      code,
      recipient
    )

    // hook works with correct password
    assert.equal(
      await hook.getSigner(recipient.toLowerCase(), dataRecipient),
      signerAddress
    )

    // create a lock
    lock = await deployLock({
      unlock,
      tokenAddress,
      keyPrice: ethers.utils.parseUnits('1', 6), // USDC has 6 decimals, we set 1 USDC
    })

    // set the hook
    await lock.setEventHooks(
      hook.address,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero
    )

    // price wihtout seetings is correct
    compareBigNumbers(
      await lock.purchasePriceFor(keyOwner.address, keyOwner.address, []),
      await lock.keyPrice()
    )

    // Set the code on the hook for the lock
    const [, signer] = await getSignatureForPassword(
      code,
      keyOwner.address.toLowerCase()
    )
    await hook.setSigner(lock.address, signer, discount, cap)
  })

  it.only('price with promo code is correct', async () => {
    const [data] = await getSignatureForPassword(
      code,
      keyOwner.address.toLowerCase()
    )
    const price = await lock.purchasePriceFor(
      keyOwner.address,
      keyOwner.address,
      data
    )
    assert.equal(ethers.utils.formatUnits(price, 6), '0.7')
  })

  it.skip('can buy tickets at discount', async () => {
    // User does not have a key
    assert.equal((await lock.balanceOf(keyOwner.address)).toNumber(), 0)
    const [data] = await getSignatureForPassword(
      code,
      keyOwner.address.toLowerCase()
    )
    // check the price
    const price = await lock.purchasePriceFor(
      keyOwner.address,
      keyOwner.address,
      data
    )
    assert.equal(ethers.utils.formatUnits(price, 6), '0.7')

    const token = await lock.tokenAddress()

    // fund!
    const tokenContract = await addERC20(token, keyOwner.address, price)

    await tokenContract.connect(keyOwner).approve(lock.address, MAX_UINT)

    // purchase!
    await lock
      .connect(keyOwner)
      .purchase(
        [price],
        [keyOwner.address],
        [keyOwner.address],
        [keyOwner.address],
        [data],
        {
          value: price,
        }
      )
    assert.equal((await lock.balanceOf(keyOwner.address)).toNumber(), 1)
  })

  it.only('use promocode when swap and purchase', async () => {
    // a user does have a key
    assert.equal((await lock.balanceOf(keyOwner.address)).toNumber(), 0)
    const [data] = await getSignatureForPassword(
      code,
      keyOwner.address.toLowerCase()
    )
    // check the price
    const price = await lock.purchasePriceFor(
      keyOwner.address,
      keyOwner.address,
      data
    )
    assert.equal(ethers.utils.formatUnits(price, 6), '0.7')

    const args = [
      [price], // keyPrices
      [keyOwner.address], // recipients
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [data], // _data
    ]

    // parse call data
    const calldata = await lock.interface.encodeFunctionData('purchase', args)

    const { swapCalldata, value, swapRouter, amountInMax } =
      await getUniswapRoute({
        tokenIn: native,
        tokenOut: usdc,
        amoutOut: price,
        recipient: swapPurchaser.address,
        chainId: 1,
      })

    const token = await lock.tokenAddress()
    const tokenContract = await addERC20(token, keyOwner.address, price)
    console.log('APPROVAL')
    console.log(`- contract: ${tokenContract.address}`)
    console.log(`- approver: ${keyOwner.address}`)
    console.log(`- approved: ${swapPurchaser.address}`)
    console.log(`- amount  : ${MAX_UINT}`)
    await tokenContract
      .connect(keyOwner)
      .approve(swapPurchaser.address, MAX_UINT)
    console.log('APPROVAL DONE')

    console.log(await tokenContract.balanceOf(keyOwner.address))
    console.log(
      await tokenContract.allowance(keyOwner.address, swapPurchaser.address)
    )

    // WHY DOES THIS FAIL?
    await tokenContract
      .connect(keyOwner)
      .transferFrom(keyOwner.address, swapPurchaser.address, 1)

    console.log('TRANSFERED')

    // do the swap and call!
    await swapPurchaser.connect(keyOwner).swapAndCall(
      lock.address,
      tokenAddress,
      amountInMax, // value in src token
      swapRouter,
      swapCalldata,
      calldata,
      { value }
    )
    assert.equal((await lock.balanceOf(keyOwner.address)).toNumber(), 1)
  })
})
