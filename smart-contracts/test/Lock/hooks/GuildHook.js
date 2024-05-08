const { expect } = require('chai')
const { ethers } = require('hardhat')
const { reverts, deployLock } = require('../../helpers')

describe('GuildHook', function () {
  it('should work as a hook', async function () {
    const [user, another, aThird] = await ethers.getSigners()
    const signer = ethers.Wallet.createRandom()

    const lock = await deployLock({
      name: 'FREE',
    })
    const GuildHook = await ethers.getContractFactory('GuildHook')
    const hook = await GuildHook.deploy()

    await hook.addSigner(await signer.getAddress())

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
    const signedMessage = await signer.signMessage(ethers.arrayify(messageHash))

    const anotherMessageHash = ethers.solidityKeccak256(
      ['string'],
      [await another.getAddress().toLowerCase()]
    )
    const anotherSignedMessage = await signer.signMessage(
      ethers.arrayify(anotherMessageHash)
    )

    // Health check!
    expect(
      ethers.verifyMessage(
        await user.getAddress().toLowerCase(),
        signedMessage
      ),
      await signer.getAddress()
    )

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

  it('should be able to add and remove signers from owner', async () => {
    const [user, anotherUser] = await ethers.getSigners()
    const signer = ethers.Wallet.createRandom()
    const GuildHook = await ethers.getContractFactory('GuildHook')
    const hook = await GuildHook.deploy()

    // Add a signer
    await hook.addSigner(await signer.getAddress())
    expect(await hook.signers(await signer.getAddress())).to.equal(true)
    expect(await hook.owner()).to.equal(await user.getAddress())

    // Transfer ownership
    expect(hook.transferOwnership(await anotherUser.getAddress()))
    expect(await hook.owner()).to.equal(await anotherUser.getAddress())

    // Add a signer again from previous owner
    const anotherSigner = ethers.Wallet.createRandom()
    await reverts(
      hook.addSigner(await anotherSigner.getAddress()),
      'Ownable: caller is not the owner'
    )
    expect(await hook.signers(await anotherSigner.getAddress())).to.equal(false)

    // Add a signer from new owner
    await hook.connect(anotherUser).addSigner(await anotherSigner.getAddress())
    expect(await hook.signers(await anotherSigner.getAddress())).to.equal(true)

    // Remove signer from new owner
    await hook.connect(anotherUser).removeSigner(await signer.getAddress())
    expect(await hook.signers(await signer.getAddress())).to.equal(false)
  })
})
