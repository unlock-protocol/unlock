const assert = require('assert')
const { ethers } = require('hardhat')
const { deployLock } = require('../../helpers')

/**
 * Helper function
 * @param {*} password
 * @param {*} message
 * @returns
 */
const getSignatureForPassword = async (password, message) => {
  // Build the signer
  const encoder = ethers.AbiCoder.defaultAbiCoder()
  const encoded = encoder.encode(['bytes32'], [ethers.id(password)])
  const privateKey = ethers.keccak256(encoded)
  const privateKeyAccount = new ethers.Wallet(privateKey)

  // Sign
  const messageHash = ethers.solidityPackedKeccak256(['string'], [message])
  const messageHashBinary = ethers.getBytes(messageHash)
  const signature = await privateKeyAccount.signMessage(messageHashBinary)

  return [signature, await privateKeyAccount.getAddress()]
}

describe('DiscountHook', function () {
  it('should work', async function () {
    const recipient = '0xF5C28ce24cf47849988f147d5C75787c0103534'.toLowerCase()

    const code = 'PROMO CODE'
    const DiscountHook = await ethers.getContractFactory('DiscountHook')
    const hook = await DiscountHook.deploy()

    const [data, signerAddress] = await getSignatureForPassword(code, recipient)

    // with wrong password
    const [badData] = await getSignatureForPassword('wrongpassword', recipient)
    assert.notEqual(
      await hook.getSigner(recipient.toLowerCase(), badData),
      signerAddress
    )

    // with correct password
    assert.equal(
      await hook.getSigner(recipient.toLowerCase(), data),
      signerAddress
    )
  })

  it('should work as a hook and apply a discount', async function () {
    const [user] = await ethers.getSigners()

    const keyPrice = ethers.parseEther('0.1')
    const lock = await deployLock({
      keyPrice,
    })
    const DiscountHook = await ethers.getContractFactory('DiscountHook')
    const hook = await DiscountHook.deploy()

    await (
      await lock.setEventHooks(
        await hook.getAddress(),
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress
      )
    ).wait()
    // Let's get the price without a promo code
    const priceWithout = await lock.purchasePriceFor(
      await user.getAddress(),
      await user.getAddress(),
      '0x'
    )
    assert.equal(ethers.formatEther(priceWithout), ethers.formatEther(keyPrice))

    const code = 'PROMOCODE'
    const discount = 3000
    const cap = 10
    const [data, signer] = await getSignatureForPassword(
      code,
      (await user.getAddress()).toLowerCase()
    )

    // Set the code on the hook for the lock
    await (
      await hook.setSigner(await lock.getAddress(), signer, discount, cap)
    ).wait()

    // Let's get the price without a promo code
    const price = await lock.purchasePriceFor(
      await user.getAddress(),
      await user.getAddress(),
      data
    )
    assert.equal(ethers.formatEther(price), '0.07')

    // Let's make a purchase!
    await (
      await lock.purchase(
        [price],
        [await user.getAddress()],
        [await user.getAddress()],
        [await user.getAddress()],
        [data],
        {
          value: price,
        }
      )
    ).wait()

    assert.equal(await lock.balanceOf(await user.getAddress()), 1n)
  })

  it('should work as a hook even when a bad signature is provided', async function () {
    const [user] = await ethers.getSigners()

    const keyPrice = ethers.parseEther('0.1')
    const lock = await deployLock({
      keyPrice,
    })
    const DiscountHook = await ethers.getContractFactory('DiscountHook')
    const hook = await DiscountHook.deploy()

    await (
      await lock.setEventHooks(
        await hook.getAddress(),
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress
      )
    ).wait()
    // Let's get the price without a promo code
    const priceWithout = await lock.purchasePriceFor(
      await user.getAddress(),
      await user.getAddress(),
      '0x'
    )
    assert.equal(ethers.formatEther(priceWithout), ethers.formatEther(keyPrice))

    // Let's get the price without a promo code
    const price = await lock.purchasePriceFor(
      await user.getAddress(),
      await user.getAddress(),
      '0x'
    )
    assert.equal(ethers.formatEther(price), '0.1')

    // Let's make a purchase!
    await (
      await lock.purchase(
        [price],
        [await user.getAddress()],
        [await user.getAddress()],
        [await user.getAddress()],
        ['0x'],
        {
          value: price,
        }
      )
    ).wait()

    assert.equal(await lock.balanceOf(await user.getAddress()), 1n)
  })

  it('should enforce the cap', async function () {
    const [user, other] = await ethers.getSigners()

    const keyPrice = ethers.parseEther('0.1')
    const lock = await deployLock({
      keyPrice,
    })
    const DiscountHook = await ethers.getContractFactory('DiscountHook')
    const hook = await DiscountHook.deploy()

    await (
      await lock.setEventHooks(
        await hook.getAddress(),
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress
      )
    ).wait()
    // Let's get the price without a promo code
    const priceWithout = await lock.purchasePriceFor(
      await user.getAddress(),
      await user.getAddress(),
      '0x'
    )
    assert.equal(ethers.formatEther(priceWithout), ethers.formatEther(keyPrice))

    const code = 'PROMOCODE'
    const discount = 3000
    const cap = 1
    const [data, signer] = await getSignatureForPassword(
      code,
      (await user.getAddress()).toLowerCase()
    )

    // Set the code on the hook for the lock
    await (
      await hook.setSigner(await lock.getAddress(), signer, discount, cap)
    ).wait()

    // Let's get the price without a promo code
    const price = await lock.purchasePriceFor(
      await user.getAddress(),
      await user.getAddress(),
      data
    )
    assert.equal(ethers.formatEther(price), '0.07')

    // Let's make a purchase!
    await (
      await lock.purchase(
        [price],
        [await user.getAddress()],
        [await user.getAddress()],
        [await user.getAddress()],
        [data],
        {
          value: price,
        }
      )
    ).wait()

    assert.equal(await lock.balanceOf(await user.getAddress()), 1n)

    // Let's now get the price again for another user with the same code
    const [dataOther] = await getSignatureForPassword(
      code,
      (await other.getAddress()).toLowerCase()
    )
    const priceOther = await lock.purchasePriceFor(
      await other.getAddress(),
      await other.getAddress(),
      dataOther
    )
    assert.equal(ethers.formatEther(priceOther), '0.1')
  })
})
