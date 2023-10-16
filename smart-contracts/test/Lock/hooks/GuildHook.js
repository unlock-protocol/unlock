const { expect } = require('chai')
const { ethers, unlock } = require('hardhat')
const { reverts } = require('../../helpers')

describe('GuildHook', function () {
  it('should work as a hook', async function () {
    const [user, another, aThird] = await ethers.getSigners()
    const signer = ethers.Wallet.createRandom()

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
    const GuildHook = await ethers.getContractFactory('GuildHook')
    const hook = await GuildHook.deploy()
    await hook.deployed()
    await hook.addSigner(signer.address)

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
    const signedMessage = await signer.signMessage(
      ethers.utils.arrayify(messageHash)
    )

    const anotherMessageHash = ethers.utils.solidityKeccak256(
      ['string'],
      [another.address.toLowerCase()]
    )
    const anotherSignedMessage = await signer.signMessage(
      ethers.utils.arrayify(anotherMessageHash)
    )

    // Health check!
    expect(
      ethers.utils.verifyMessage(user.address.toLowerCase(), signedMessage),
      signer.address
    )

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

  it('should be able to add and remove signers from owner', async () => {
    const [user, anotherUser] = await ethers.getSigners()
    const signer = ethers.Wallet.createRandom()
    const GuildHook = await ethers.getContractFactory('GuildHook')
    const hook = await GuildHook.deploy()
    await hook.deployed()

    // Add a signer
    await hook.addSigner(signer.address)
    expect(await hook.signers(signer.address)).to.equal(true)
    expect(await hook.owner()).to.equal(user.address)

    // Transfer ownership
    expect(hook.transferOwnership(anotherUser.address))
    expect(await hook.owner()).to.equal(anotherUser.address)

    // Add a signer again from previous owner
    const anotherSigner = ethers.Wallet.createRandom()
    await reverts(
      hook.addSigner(anotherSigner.address),
      'Ownable: caller is not the owner'
    )
    expect(await hook.signers(anotherSigner.address)).to.equal(false)

    // Add a signer from new owner
    await hook.connect(anotherUser).addSigner(anotherSigner.address)
    expect(await hook.signers(anotherSigner.address)).to.equal(true)

    // Remove signer from new owner
    await hook.connect(anotherUser).removeSigner(signer.address)
    expect(await hook.signers(signer.address)).to.equal(false)
  })
})
