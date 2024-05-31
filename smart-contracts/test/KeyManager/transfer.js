const { ethers } = require('hardhat')
const { setup } = require('./setup')
const { reverts } = require('../helpers')
const assert = require('assert')

let lock
let keyManager, locksmith, grantee, attacker, realUser
const OneMonthFromNow =
  Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 30
const OneDayAgo = Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24
const OneHourFromNow = Math.floor(new Date().getTime() / 1000) + 60 * 60

let domain
const types = {
  Transfer: [
    { name: 'lock', type: 'address' },
    { name: 'token', type: 'uint256' },
    { name: 'owner', type: 'address' },
    { name: 'deadline', type: 'uint256' },
  ],
}
describe('KeyManager', () => {
  beforeEach(async () => {
    ;[keyManager, lock] = await setup()
    ;[, locksmith, grantee, attacker, realUser] = await ethers.getSigners()
    // Let's now aidrop a key to an address and set the keyManager as.. keyManager!
    await keyManager.addLocksmith(await locksmith.getAddress())
    await lock.grantKeys(
      [await grantee.getAddress()],
      [OneMonthFromNow],
      [await keyManager.getAddress()]
    )
    const { chainId } = await ethers.provider.getNetwork()
    domain = {
      name: 'KeyManager',
      version: '1',
      chainId,
      verifyingContract: await keyManager.getAddress(),
    }
  })

  it('should fail transfers if they have expired', async () => {
    const transfer = {
      lock: await lock.getAddress(),
      token: 1,
      owner: await grantee.getAddress(),
      deadline: OneDayAgo,
    }
    const locksmithSigner = await ethers.getSigner(await locksmith.getAddress())
    const signature = await locksmithSigner.signTypedData(
      domain,
      types,
      transfer
    )
    await reverts(
      keyManager.transfer(
        transfer.lock,
        transfer.token,
        transfer.owner,
        transfer.deadline,
        signature
      ),
      `VM Exception while processing transaction: reverted with custom error 'TOO_LATE()'`
    )
  })

  it('should fail transfers if they were not signed by the signer', async () => {
    const transfer = {
      lock: await lock.getAddress(),
      token: 1,
      owner: await grantee.getAddress(),
      deadline: OneHourFromNow,
    }
    const attackerSigner = await ethers.getSigner(await attacker.getAddress())
    const signature = await attackerSigner.signTypedData(
      domain,
      types,
      transfer
    )
    await reverts(
      keyManager.transfer(
        transfer.lock,
        transfer.token,
        transfer.owner,
        transfer.deadline,
        signature
      ),
      `VM Exception while processing transaction: reverted with custom error 'NOT_AUTHORIZED("0x90F79bf6EB2c4f870365E785982E1f101E93b906")'`
    )
  })

  it('should lend the key to the sender if the signature matches', async () => {
    const transfer = {
      lock: await lock.getAddress(),
      token: 1,
      owner: await grantee.getAddress(),
      deadline: OneHourFromNow,
    }
    assert.notEqual(await lock.ownerOf(1), await realUser.getAddress())
    const locksmithSigner = await ethers.getSigner(await locksmith.getAddress())
    const signature = await locksmithSigner.signTypedData(
      domain,
      types,
      transfer
    )
    assert.equal(
      ethers.verifyTypedData(domain, types, transfer, signature),
      await locksmith.getAddress()
    )
    const realUserSigner = await ethers.getSigner(await realUser.getAddress())
    await keyManager
      .connect(realUserSigner)
      .transfer(
        transfer.lock,
        transfer.token,
        transfer.owner,
        transfer.deadline,
        signature
      )
    assert.equal(await lock.ownerOf(1), await realUser.getAddress())
    assert.equal(await lock.keyManagerOf(1), await keyManager.getAddress())
  })
})
