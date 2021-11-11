const { expect } = require('chai')
const { ethers } = require('hardhat')
const { getProxyAddress } = require('../../helpers/deployments.js')

describe('createLock (deploy template with Proxy)', () => {
  let unlock
  let publicLock
  // let randomAddress

  beforeEach(async () => {
    // const { address } = await ethers.Wallet.createRandom()
    // randomAddress = address

    const Unlock = await ethers.getContractFactory('Unlock')
    const { chainId } = await ethers.provider.getNetwork()

    const unlockAddress = getProxyAddress(chainId, 'Unlock')
    unlock = Unlock.attach(unlockAddress)

    const PublicLock = await ethers.getContractFactory('PublicLock')
    const publicLockAddress = getProxyAddress(chainId, 'PublicLock')
    publicLock = PublicLock.attach(publicLockAddress)
    console.log(publicLock.interface)
  })

  it('creates a lock', () => {})

  describe('Versions/implementations', () => {
    it('Should forbid non-owner to add impl', async function () {
      const [, , signer] = await ethers.getSigners()
      await expect(
        unlock.connect(signer).addImpl(publicLock.address, 3)
      ).to.be.revertedWith('caller does not have unlock rights')
    })

    /*
    it("Should store latest version properly", async function () {

      // make sure everything is stored properly
      expect(await unlock.latestVersion()).to.equals(1)

      const tx = await unlock.addImpl(boxV2.address, 2)
      await tx.wait()
      expect(await unlock.latestVersion()).to.equals(2)

      // jump versions
      const tx2 = await unlock.addImpl(randomAddress, 532)
      await tx2.wait()
      expect(await unlock.latestVersion()).to.equals(532)
    })

    it("Should forbid same address / version to be reused", async function () {

      await expect(
        unlock.addImpl(box.address, 3)
      ).to.be.revertedWith("address already used by another version");

      await expect(
        unlock.addImpl(boxV2.address, 1)
      ).to.be.revertedWith("version already assigned");
    })

    it("Should store impls properly", async function () {

      expect(await unlock.impls(1)).to.equals(box.address)
      expect(await unlock.versions(box.address)).to.equals(1)

      // make sure everything is stored properly
      const tx2 = await unlock.addImpl(boxV2.address, 2)
      await tx2.wait()
      expect(await unlock.impls(2)).to.equals(boxV2.address)
      expect(await unlock.versions(boxV2.address)).to.equals(2)

      // add a random template
      const tx = await unlock.addImpl(randomAddress, 3)
      const { events } = await tx.wait()
      const evt = events.find((v) => v.event === 'BoxTemplateAdded')
      const { impl } = evt.args
      expect(impl).to.equals(randomAddress)
      expect(await unlock.impls(3)).to.equals(randomAddress)
      expect(await unlock.versions(randomAddress)).to.equals(3)

    })
    */
  })
})
