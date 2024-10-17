const assert = require('assert')
const { ethers } = require('hardhat')
const { reverts, deployLock } = require('../../helpers')

describe('GitcoinHook', function () {
  it('should work as a hook', async function () {
    const [user, another, aThird] = await ethers.getSigners()
    const signer = ethers.Wallet.createRandom()

    const lock = await deployLock({
      name: 'FREE',
    })
    const GitcoinHook = await ethers.getContractFactory('GitcoinHook')
    const hook = await GitcoinHook.deploy()

    await hook.addSigner(await signer.getAddress())

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

    const messageHash = ethers.solidityPackedKeccak256(
      ['string'],
      [(await user.getAddress()).toLowerCase()]
    )
    const signedMessage = await signer.signMessage(ethers.getBytes(messageHash))

    const anotherMessageHash = ethers.solidityPackedKeccak256(
      ['string'],
      [(await another.getAddress()).toLowerCase()]
    )
    const anotherSignedMessage = await signer.signMessage(
      ethers.getBytes(anotherMessageHash)
    )

    // Health check!
    assert(
      ethers.verifyMessage(
        (await user.getAddress()).toLowerCase(),
        signedMessage
      ),
      await signer.getAddress()
    )

    // purchase a key
    const tx = await lock.purchase(
      [0],
      [await user.getAddress(), await another.getAddress()],
      [await user.getAddress(), await another.getAddress()],
      [await user.getAddress(), await another.getAddress()],
      [signedMessage, anotherSignedMessage]
    )
    await tx.wait()

    // purchase a key with the wrong signed message
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

    // purchase a key with no signed message
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

  it('add and remove signers from owner', async () => {
    const [user, anotherUser] = await ethers.getSigners()
    const signer = ethers.Wallet.createRandom()
    const GitcoinHook = await ethers.getContractFactory('GitcoinHook')
    const hook = await GitcoinHook.deploy()

    // Add a signer
    await hook.addSigner(await signer.getAddress())
    assert.equal(await hook.signers(await signer.getAddress()), true)
    assert.equal(await hook.owner(), await user.getAddress())
    const previousOwner = await hook.owner()

    // Transfer ownership
    await hook.transferOwnership(await anotherUser.getAddress())
    assert.equal(await hook.owner(), await anotherUser.getAddress())

    // Add a signer again from previous owner
    const anotherSigner = ethers.Wallet.createRandom()
    await reverts(
      hook.addSigner(await anotherSigner.getAddress()),
      `OwnableUnauthorizedAccount("${previousOwner}")`
    )
    assert.equal(await hook.signers(await anotherSigner.getAddress()), false)

    // Add a signer from new owner
    await hook.connect(anotherUser).addSigner(await anotherSigner.getAddress())
    assert.equal(await hook.signers(await anotherSigner.getAddress()), true)

    // Remove signer from new owner
    await hook.connect(anotherUser).removeSigner(await signer.getAddress())
    assert.equal(await hook.signers(await signer.getAddress()), false)
  })
})
