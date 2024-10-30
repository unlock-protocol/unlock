const assert = require('assert')
const { ethers } = require('hardhat')
const { reverts, deployLock } = require('../../helpers')

describe('CaptchaHook', function () {
  it('Should work', async function () {
    const [user] = await ethers.getSigners()
    const secretSigner = ethers.Wallet.createRandom()
    const sender = '0xF5C28ce24Acf47849988f147d5C75787c0103534'.toLowerCase()

    const CaptchaHook = await ethers.getContractFactory('CaptchaHook')
    const hook = await CaptchaHook.deploy()

    await (await hook.addSigner(await secretSigner.getAddress())).wait()

    // signing wrong message
    assert.equal(
      await hook.checkIsSigner(sender, await secretSigner.signMessage('hello')),
      false
    )
    assert.equal(
      await hook.checkIsSigner('hello', await secretSigner.signMessage(sender)),
      false
    )

    // wrong signer
    assert.equal(
      await hook.checkIsSigner(sender, await user.signMessage(sender)),
      false
    )

    // Correct signer, correct message
    const message = 'hello'
    const messageHash = ethers.solidityPackedKeccak256(
      ['string'],
      [message.toLowerCase()]
    )
    const signedMessage = await secretSigner.signMessage(
      ethers.getBytes(messageHash)
    )
    assert.equal(
      ethers.verifyMessage(ethers.getBytes(messageHash), signedMessage),
      await secretSigner.getAddress()
    )
    assert.equal(await hook.checkIsSigner(message, signedMessage), true)
  })

  it('should work as a hook', async function () {
    const [user, another, aThird] = await ethers.getSigners()
    const secretSigner = ethers.Wallet.createRandom()

    const lock = await deployLock({
      name: 'FREE',
    })
    const CaptchaHook = await ethers.getContractFactory('CaptchaHook')
    const hook = await CaptchaHook.deploy()

    await (await hook.addSigner(await secretSigner.getAddress())).wait()

    // Set the hook on avatar
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

    const msg = (await user.getAddress()).toLowerCase()
    const messageHash = ethers.solidityPackedKeccak256(['string'], [msg])
    const signedMessage = await secretSigner.signMessage(
      ethers.getBytes(messageHash)
    )

    const anotherMessageHash = ethers.solidityPackedKeccak256(
      ['string'],
      [(await another.getAddress()).toLowerCase()]
    )
    const anotherSignedMessage = await secretSigner.signMessage(
      ethers.getBytes(anotherMessageHash)
    )

    // Health check!
    assert.equal(
      ethers.verifyMessage(ethers.getBytes(messageHash), signedMessage),
      await secretSigner.getAddress()
    )
    assert.equal(await hook.checkIsSigner(msg, signedMessage), true)

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
        ['0x']
      ),
      'ECDSAInvalidSignatureLength'
    )
  })
})
