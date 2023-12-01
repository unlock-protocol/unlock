const { expect } = require('chai')
const { ethers, unlock } = require('hardhat')
const { reverts } = require('../../helpers')

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

describe('PasswordRequiredHook', function () {
  it('Should work', async function () {
    const recipient = '0xF5C28ce24cf47849988f147d5C75787c0103534'.toLowerCase()

    const password = 'password' // (Math.random()).toString(36).substring(2);
    const PasswordRequiredHook = await ethers.getContractFactory(
      'PasswordRequiredHook'
    )
    const hook = await PasswordRequiredHook.deploy()
    await hook.deployed()

    const [data, signerAddress] = await getSignatureForPassword(
      password,
      recipient
    )

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
    const keyPrice = 0

    const { lock } = await unlock.createLock({
      expirationDuration,
      maxNumberOfKeys,
      keyPrice,
      name: 'ticket',
    })
    const PasswordRequiredHook = await ethers.getContractFactory(
      'PasswordRequiredHook'
    )
    const hook = await PasswordRequiredHook.deploy()
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

    // Build the signer from password
    const password = 'unguessable!'
    const [data, signer] = await getSignatureForPassword(
      password,
      user.address.toLowerCase()
    )

    const usages = 10

    // Set the password on the hook for the lock
    await (await hook.setSigner(lock.address, signer, usages)).wait()

    const s = await hook.signers(lock.address, signer)
    expect(s.toString()).to.equal(usages.toString())

    // And now make a purchase that should fail because we did not submit a data
    await reverts(
      lock.purchase([0], [user.address], [user.address], [user.address], [])
    )

    // And a purchase that fails because we use the wrong password
    const [badData] = await getSignatureForPassword(
      'wrong password',
      user.address.toLowerCase()
    )
    await reverts(
      lock.purchase(
        [0],
        [user.address],
        [user.address],
        [user.address],
        [badData]
      )
    )

    // And a purchase that succeeds when we use the correct password!
    await reverts(
      lock.purchase([0], [user.address], [user.address], [user.address], [data])
    ).not

    // Check the usages!
    const usageAfter = await hook.counters(lock.address, signer)
    expect(usageAfter.toString()).to.equal((1).toString())
  })

  it('should fail if the code has been used enough', async function () {
    const [user, another] = await ethers.getSigners()

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
    const PasswordRequiredHook = await ethers.getContractFactory(
      'PasswordRequiredHook'
    )
    const hook = await PasswordRequiredHook.deploy()
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

    // Build the signer from password
    const password = 'unguessable!'
    const [data, signer] = await getSignatureForPassword(
      password,
      user.address.toLowerCase()
    )

    const usages = 1

    // Set the password on the hook for the lock
    await (await hook.setSigner(lock.address, signer, usages)).wait()

    // And a purchase that succeeds when we use the correct password!
    await reverts(
      lock.purchase([0], [user.address], [user.address], [user.address], [data])
    ).not

    const [newData] = await getSignatureForPassword(
      password,
      another.address.toLowerCase()
    )

    // And a purchase that succeeds when we use the correct password!
    await reverts(
      lock.purchase(
        [0],
        [another.address],
        [another.address],
        [another.address],
        [newData]
      )
    )
  })
})
