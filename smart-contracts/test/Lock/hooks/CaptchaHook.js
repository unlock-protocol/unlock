const { expect } = require('chai')
const { ethers, unlock } = require('hardhat')
const { reverts } = require('../../helpers')

describe('CaptchaHook', function () {
  it('Should work', async function () {
    const [user] = await ethers.getSigners()
    const secretSigner = ethers.Wallet.createRandom()
    const sender = '0xF5C28ce24Acf47849988f147d5C75787c0103534'.toLowerCase()

    const CaptchaHook = await ethers.getContractFactory('CaptchaHook')
    const hook = await CaptchaHook.deploy(secretSigner.address)
    await hook.deployed()

    // signing wrong message
    expect(
      await hook.checkIsSigner(sender, await secretSigner.signMessage('hello'))
    ).to.equal(false)
    expect(
      await hook.checkIsSigner('hello', await secretSigner.signMessage(sender))
    ).to.equal(false)

    // wrong signer
    expect(
      await hook.checkIsSigner(sender, await user.signMessage(sender))
    ).to.equal(false)

    // Correct signer, correct message
    const message = 'hello'
    const messageHash = ethers.utils.solidityKeccak256(
      ['string'],
      [message.toLowerCase()]
    )
    const signedMessage = await secretSigner.signMessage(
      ethers.utils.arrayify(messageHash)
    )
    expect(
      ethers.utils.verifyMessage(message, signedMessage),
      secretSigner.address
    )
    expect(await hook.checkIsSigner(message, signedMessage)).to.equal(true)
  })

  it('should work as a hook', async function () {
    const [user, another, aThird] = await ethers.getSigners()
    const secretSigner = ethers.Wallet.createRandom()

    await unlock.deployProtocol()
    const expirationDuration = 60 * 60 * 24 * 7
    const maxNumberOfKeys = 100
    const keyPrice = 0

    const { lock } = await unlock.createLock({
      expirationDuration,
      maxNumberOfKeys,
      keyPrice,
      name: 'ticket',
    })
    const CaptchaHook = await ethers.getContractFactory('CaptchaHook')
    const hook = await CaptchaHook.deploy(secretSigner.address)
    await hook.deployed()

    // Set the hook on avatar
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

    const messageHash = ethers.utils.solidityKeccak256(
      ['string'],
      [user.address.toLowerCase()]
    )
    const signedMessage = await secretSigner.signMessage(
      ethers.utils.arrayify(messageHash)
    )

    const anotherMessageHash = ethers.utils.solidityKeccak256(
      ['string'],
      [another.address.toLowerCase()]
    )
    const anotherSignedMessage = await secretSigner.signMessage(
      ethers.utils.arrayify(anotherMessageHash)
    )

    // Health check!
    expect(
      ethers.utils.verifyMessage(user.address.toLowerCase(), signedMessage),
      secretSigner.address
    )
    expect(
      await hook.checkIsSigner(user.address.toLowerCase(), signedMessage)
    ).to.equal(true)

    // Let's now purchase a key!
    const tx = await lock.purchase(
      [0],
      [user.address, another.address],
      [user.address, another.address],
      [user.address, another.address],
      [signedMessage, anotherSignedMessage]
    )
    await tx.wait()

    // Let's now purchase a key with the wrong signed message
    await reverts(
      lock.purchase(
        [0],
        [aThird.address],
        [aThird.address],
        [aThird.address],
        [signedMessage]
      ),
      'WRONG_SIGNATURE'
    )

    // Let's now purchase a key with no signed message
    await reverts(
      lock.purchase(
        [0],
        [aThird.address],
        [aThird.address],
        [aThird.address],
        [[]]
      ),
      'ECDSA: invalid signature length'
    )
  })
})
