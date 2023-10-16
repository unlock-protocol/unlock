const { expect } = require('chai')
const { ethers, unlock } = require('hardhat')

/**
 * Helper function
 * @param {*} password
 * @param {*} message
 * @returns
 */
const getSignatureForPassword = async (password, message) => {
  // Build the signer
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ['bytes32'],
    [ethers.utils.id(password)]
  )
  const privateKey = ethers.utils.keccak256(encoded)
  const privateKeyAccount = new ethers.Wallet(privateKey)

  // Sign
  const messageHash = ethers.utils.solidityKeccak256(['string'], [message])
  const messageHashBinary = ethers.utils.arrayify(messageHash)
  const signature = await privateKeyAccount.signMessage(messageHashBinary)

  return [signature, privateKeyAccount.address]
}

describe('DiscountHook', function () {
  it('should work', async function () {
    const recipient = '0xF5C28ce24cf47849988f147d5C75787c0103534'.toLowerCase()

    const code = 'PROMO CODE'
    const DiscountHook = await ethers.getContractFactory('DiscountHook')
    const hook = await DiscountHook.deploy()
    await hook.deployed()

    const [data, signerAddress] = await getSignatureForPassword(code, recipient)

    // with wrong password
    const [badData] = await getSignatureForPassword('wrongpassword', recipient)
    expect(await hook.getSigner(recipient.toLowerCase(), badData)).to.not.equal(
      signerAddress
    )

    // with correct password
    expect(await hook.getSigner(recipient.toLowerCase(), data)).to.equal(
      signerAddress
    )
  })

  it('should work as a hook', async function () {
    const [user] = await ethers.getSigners()

    await unlock.deployProtocol()
    const expirationDuration = 60 * 60 * 24 * 7
    const maxNumberOfKeys = 100
    const keyPrice = ethers.utils.parseEther('0.1')

    const { lock } = await unlock.createLock({
      expirationDuration,
      maxNumberOfKeys,
      keyPrice,
      name: 'ticket',
    })
    const DiscountHook = await ethers.getContractFactory('DiscountHook')
    const hook = await DiscountHook.deploy()
    await hook.deployed()

    await (
      await lock.setEventHooks(
        hook.address,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero
      )
    ).wait()
    // Let's get the price without a promo code
    const priceWithout = await lock.purchasePriceFor(
      user.address,
      user.address,
      []
    )
    assert.equal(
      ethers.utils.formatEther(priceWithout),
      ethers.utils.formatEther(keyPrice)
    )

    const code = 'PROMOCODE'
    const discount = 3000
    const [data, signer] = await getSignatureForPassword(
      code,
      user.address.toLowerCase()
    )

    // Set the code on the hook for the lock
    await (await hook.setSigner(lock.address, signer, discount)).wait()

    // Let's get the price without a promo code
    const price = await lock.purchasePriceFor(user.address, user.address, data)
    assert.equal(ethers.utils.formatEther(price), '0.07')

    // Let's make a purchase!
    await (
      await lock.purchase(
        [price],
        [user.address],
        [user.address],
        [user.address],
        [data],
        {
          value: price,
        }
      )
    ).wait()

    expect((await lock.balanceOf(user.address)).toNumber()).to.equal(1)
  })
})
