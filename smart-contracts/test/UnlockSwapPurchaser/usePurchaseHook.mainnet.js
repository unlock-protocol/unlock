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

const someTokens = ethers.utils.parseUnits('1', 'ether')

let swapPurchaser, unlock, lock, tokenAddress, token

let owner, keyOwner
let native, usdc

// hooks params
const code = 'PROMO CODE'
const recipient = '0xF5C28ce24cf47849988f147d5C75787c0103534'.toLowerCase()
const discount = 3000 // basis points
const cap = 10

describe('UnlockSwapPurchaser / withdraw', () => {
  before(async () => {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }
    ;[owner, keyOwner] = await ethers.getSigners()

    // fund deployer
    await addSomeETH(owner.address)

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

    const routers = [universalRouterAddress]
    swapPurchaser = await UnlockSwapPurchaser.deploy(
      unlock.address,
      PERMIT2_ADDRESS,
      routers
    )

    // get usdc token for testing
    ;({ native, usdc } = await getUniswapTokens(chainId))
    tokenAddress = usdc.address
    token = await addERC20(tokenAddress, keyOwner.address, someTokens)

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
    })

    // set allowances
    await token.connect(keyOwner).approve(swapPurchaser.address, MAX_UINT)
    await token.connect(keyOwner).approve(lock.address, MAX_UINT)

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

  it('price with promo code is correct', async () => {
    const [data] = await getSignatureForPassword(
      code,
      keyOwner.address.toLowerCase()
    )
    const price = await lock.purchasePriceFor(
      keyOwner.address,
      keyOwner.address,
      data
    )
    assert.equal(ethers.utils.formatEther(price), '0.007')
  })

  it('can buy tickets at discount', async () => {
    assert.equal((await lock.balanceOf(keyOwner.address)).toNumber(), 0)
    const [data] = await getSignatureForPassword(
      code,
      keyOwner.address.toLowerCase()
    )
    const price = await lock.purchasePriceFor(
      keyOwner.address,
      keyOwner.address,
      data
    )
    assert.equal(ethers.utils.formatEther(price), '0.007')
    await lock.purchase(
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

  it('use promocode when swap and purchase', async () => {
    assert.equal((await lock.balanceOf(keyOwner.address)).toNumber(), 0)
    const [data] = await getSignatureForPassword(
      code,
      keyOwner.address.toLowerCase()
    )
    const price = await lock.purchasePriceFor(
      keyOwner.address,
      keyOwner.address,
      data
    )
    const args = [
      [price], // keyPrices
      [keyOwner.address], // recipients
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]], // _data
    ]

    // parse call data
    const calldata = await lock.interface.encodeFunctionData('purchase', args)

    const { swapCalldata, value, swapRouter, amountInMax } =
      await getUniswapRoute({
        tokenIn: native,
        tokenOut: usdc,
        amoutOut: price,
        recipient: swapPurchaser.address,
      })

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
