const assert = require('assert')
const { ethers } = require('hardhat')
const { reverts, deployLock } = require('../../helpers')

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

describe('PasswordRequiredHook', function () {
  it('Should work', async function () {
    const recipient = '0xF5C28ce24cf47849988f147d5C75787c0103534'.toLowerCase()

    const password = 'password' // (Math.random()).toString(36).substring(2);
    const PasswordRequiredHook = await ethers.getContractFactory(
      'PasswordRequiredHook'
    )
    const hook = await PasswordRequiredHook.deploy()

    const [data, signerAddress] = await getSignatureForPassword(
      password,
      recipient
    )

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

  it('should work as a hook', async function () {
    const [user] = await ethers.getSigners()

    const lock = await deployLock({
      name: 'FREE',
    })
    const PasswordRequiredHook = await ethers.getContractFactory(
      'PasswordRequiredHook'
    )
    const hook = await PasswordRequiredHook.deploy()

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

    // Build the signer from password
    const password = 'unguessable!'
    const [data, signer] = await getSignatureForPassword(
      password,
      (await user.getAddress()).toLowerCase()
    )

    const usages = 10n

    // Set the password on the hook for the lock
    await (await hook.setSigner(await lock.getAddress(), signer, usages)).wait()

    const s = await hook.signers(await lock.getAddress(), signer)
    assert.equal(s, usages)

    // And now make a purchase that should fail because we did not submit a data
    await reverts(
      lock.purchase(
        [0],
        [await user.getAddress()],
        [await user.getAddress()],
        [await user.getAddress()],
        []
      )
    )

    // And a purchase that fails because we use the wrong password
    const [badData] = await getSignatureForPassword(
      'wrong password',
      (await user.getAddress()).toLowerCase()
    )
    await reverts(
      lock.purchase(
        [0],
        [await user.getAddress()],
        [await user.getAddress()],
        [await user.getAddress()],
        [badData]
      )
    )

    // And a purchase that succeeds when we use the correct password!
    await lock.purchase(
      [0],
      [await user.getAddress()],
      [await user.getAddress()],
      [await user.getAddress()],
      [data]
    )

    // Check the usages!
    const usageAfter = await hook.counters(await lock.getAddress(), signer)
    assert.equal(usageAfter, 1n)
  })

  it('should fail if the code has been used enough', async function () {
    const [user, another] = await ethers.getSigners()

    const lock = await deployLock({
      name: 'FREE',
    })
    const PasswordRequiredHook = await ethers.getContractFactory(
      'PasswordRequiredHook'
    )
    const hook = await PasswordRequiredHook.deploy()

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

    // Build the signer from password
    const password = 'unguessable!'
    const [data, signer] = await getSignatureForPassword(
      password,
      (await user.getAddress()).toLowerCase()
    )

    const usages = 1

    // Set the password on the hook for the lock
    await (await hook.setSigner(await lock.getAddress(), signer, usages)).wait()

    // And a purchase that succeeds when we use the correct password!
    await reverts(
      lock.purchase(
        [0],
        [await user.getAddress()],
        [await user.getAddress()],
        [await user.getAddress()],
        [data]
      )
    ).not

    const [newData] = await getSignatureForPassword(
      password,
      (await another.getAddress()).toLowerCase()
    )

    // And a purchase that succeeds when we use the correct password!
    await reverts(
      lock.purchase(
        [0],
        [await another.getAddress()],
        [await another.getAddress()],
        [await another.getAddress()],
        [newData]
      )
    )
  })
})
