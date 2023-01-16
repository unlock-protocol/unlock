const { ethers } = require('hardhat')
const { setup } = require('./setup')
const { reverts } = require('../helpers')

let lock
let keyManager
const OneMonthFromNow = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 30
const OneDayAgo = Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24
const OneHourFromNow = Math.floor(new Date().getTime() / 1000) + 60 * 60

let domain
const types = {
  Transfer: [
    { name: 'lock', type: 'address' },
    { name: 'token', type: 'uint256' },
    { name: 'owner', type: 'address' },
    { name: 'deadline', type: 'uint256' }
  ],
};
contract('KeyManager', ([, locksmith, grantee, attacker, realUser]) => {

  beforeEach(async () => {
    [keyManager, lock] = await setup()
    // Let's now aidrop a key to an address and set the keyManager as... keyManager!
    await keyManager.addLocksmith(locksmith)
    await lock.grantKeys([grantee], [OneMonthFromNow], [keyManager.address])
    const { chainId } = await ethers.provider.getNetwork()
    domain = {
      name: 'KeyManager',
      version: '1',
      chainId,
      verifyingContract: keyManager.address
    };

  })

  it('should fail transfers if they have expired', async () => {
    const transfer = {
      lock: lock.address,
      token: 1,
      owner: grantee,
      deadline: OneDayAgo,
    };
    const locksmithSigner = await ethers.getSigner(locksmith)
    const signature = await locksmithSigner._signTypedData(domain, types, transfer);
    await reverts(keyManager.transfer(transfer.lock, transfer.token, transfer.owner, transfer.deadline, signature), `VM Exception while processing transaction: reverted with custom error 'TOO_LATE()'`)
  })

  it('should fail transfers if they were not signed by the signer', async () => {
    const transfer = {
      lock: lock.address,
      token: 1,
      owner: grantee,
      deadline: OneHourFromNow,
    };
    const attackerSigner = await ethers.getSigner(attacker)
    const signature = await attackerSigner._signTypedData(domain, types, transfer);
    await reverts(keyManager.transfer(transfer.lock, transfer.token, transfer.owner, transfer.deadline, signature), `VM Exception while processing transaction: reverted with custom error 'NOT_AUTHORIZED("0x90F79bf6EB2c4f870365E785982E1f101E93b906")'`)
  })


  it('should lend the key to the sender if the signature matches', async () => {
    const transfer = {
      lock: lock.address,
      token: 1,
      owner: grantee,
      deadline: OneHourFromNow,
    };
    expect(await lock.ownerOf(1)).not.to.equal(realUser)
    const locksmithSigner = await ethers.getSigner(locksmith)
    const signature = await locksmithSigner._signTypedData(domain, types, transfer);
    expect(ethers.utils.verifyTypedData(domain, types, transfer, signature)).to.equal(locksmith)
    const realUserSigner = await ethers.getSigner(realUser)
    await keyManager.connect(realUserSigner).transfer(transfer.lock, transfer.token, transfer.owner, transfer.deadline, signature)
    expect(await lock.ownerOf(1)).to.equal(realUser)
    expect(await lock.keyManagerOf(1)).to.equal(keyManager.address)
  })
})
