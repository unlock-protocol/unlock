const { expect } = require('chai')
const { ethers } = require('hardhat')
const { reverts, deployLock } = require('../../helpers')

describe('CaptchaHook', function () {
  it('Should work', async function () {
    const [user] = await ethers.getSigners()
    const secretSigner = ethers.Wallet.createRandom()
    const sender = '0xF5C28ce24Acf47849988f147d5C75787c0103534'.toLowerCase()

    const CaptchaHook = await ethers.getContractFactory('CaptchaHook')
    const hook = await CaptchaHook.deploy()
    await hook.deployed()

    await (await hook.addSigner(await secretSigner.getAddress())).wait()

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
    const messageHash = ethers.solidityKeccak256(
      ['string'],
      [message.toLowerCase()]
    )
    const signedMessage = await secretSigner.signMessage(
      ethers.arrayify(messageHash)
    )
    expect(
      ethers.verifyMessage(message, signedMessage),
      await secretSigner.getAddress()
    )
    expect(await hook.checkIsSigner(message, signedMessage)).to.equal(true)
  })

  it('should work as a hook', async function () {
    const [user, another, aThird] = await ethers.getSigners()
    const secretSigner = ethers.Wallet.createRandom()

    const lock = await deployLock({
      name: 'FREE',
    })
    const CaptchaHook = await ethers.getContractFactory('CaptchaHook')
    const hook = await CaptchaHook.deploy()
    await hook.deployed()

    await (await hook.addSigner(await secretSigner.getAddress())).wait()

    // Set the hook on avatar
    await (
      await lock.setEventHooks(
        await hook.getAddress(),
        ethers.AddressZero,
        ethers.AddressZero,
        ethers.AddressZero,
        ethers.AddressZero,
        ethers.AddressZero,
        ethers.AddressZero
      )
    ).wait()

    const messageHash = ethers.solidityKeccak256(
      ['string'],
      [await user.getAddress().toLowerCase()]
    )
    const signedMessage = await secretSigner.signMessage(
      ethers.arrayify(messageHash)
    )

    const anotherMessageHash = ethers.solidityKeccak256(
      ['string'],
      [await another.getAddress().toLowerCase()]
    )
    const anotherSignedMessage = await secretSigner.signMessage(
      ethers.arrayify(anotherMessageHash)
    )

    // Health check!
    expect(
      ethers.verifyMessage(
        await user.getAddress().toLowerCase(),
        signedMessage
      ),
      await secretSigner.getAddress()
    )
    expect(
      await hook.checkIsSigner(
        await user.getAddress().toLowerCase(),
        signedMessage
      )
    ).to.equal(true)

    // Let's now purchase a key!
    const tx = await lock.purchase(
      [0],
      [await user.getAddress(), await another.getAddress()],
      [await user.getAddress(), await another.getAddress()],
      [await user.getAddress(), await another.getAddress()],
      [signedMessage, anotherSignedMessage]
    )
    await tx.wait()

    // Let's now purchase a key with the wrong signed message
    await reverts(
      lock.purchase(
        [0],
        [await aThird.getAddress()],
        [await aThird.getAddress()],
        [await aThird.getAddress()],
        [signedMessage]
      ),
      'WRONG_SIGNATURE'
    )

    // Let's now purchase a key with no signed message
    await reverts(
      lock.purchase(
        [0],
        [await aThird.getAddress()],
        [await aThird.getAddress()],
        [await aThird.getAddress()],
        [[]]
      ),
      'ECDSA: invalid signature length'
    )
  })
})
