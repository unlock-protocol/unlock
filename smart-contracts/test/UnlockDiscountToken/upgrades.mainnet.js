const { ethers, assert, network } = require('hardhat')

// NB : this needs to be run against a mainnet fork using
const UDTProxyContractAdress = '0x90DE74265a416e1393A450752175AED98fe11517'
const UDTDeployerAdress = '0x33ab07dF7f09e793dDD1E9A25b079989a557119A'

contract('UnlockDiscountToken (on mainnet)', async () => {
  let unlockDiscountToken
  let UDTDeployer
  // const mintAmount = 1000
  // const UnlockDiscountTokenV2 = await ethers.getContractFactory(
  //     'UnlockDiscountTokenV2'
  // )

  before(async function setupMainnetForkTestEnv() {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }

    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [UDTDeployerAdress],
    })

    // get deployer
    UDTDeployer = await ethers.getSigner(UDTDeployerAdress)

    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountToken',
      UDTDeployer
    )

    unlockDiscountToken = await UnlockDiscountToken.attach(
      UDTProxyContractAdress
    )
  })

  describe('The mainnet fork', () => {
    it('impersonates UDT deployer correctly', async () => {
      const { signer } = unlockDiscountToken
      assert.equal(signer.address, UDTDeployerAdress)
    })

    it('UDT deployer has been revoked', async () => {
      assert.equal(await unlockDiscountToken.isMinter(UDTDeployerAdress), false)
    })

    it('UDT deployer can set a new minter', async () => {
      const [minter] = await ethers.getSigners()

      // TODO: this reverts with Role error
      await unlockDiscountToken.addMinter(minter.address)
    })

    // it('impersonates minter properly', async () => {
    //     // mint some tokens
    //     await unlockDiscountToken.mint(recipient.address, mintAmount, { from: UDTMinterAdress.address })
    // })
  })

  describe('Existing UDT contract', () => {
    it('starting supply is NOT 0', async () => {
      const totalSupply = await unlockDiscountToken.totalSupply()
      assert.equal(totalSupply.eq(0), false)
      // more than initial pre-mined 1M
      assert(totalSupply.gt(ethers.utils.parseEther('1000000')))
    })
  })
  
  describe('minting tokens', () => {
    beforeEach( async () => {
      const tx = await lock.purchase(0, keyBuyer, referrer, [], {
        from: keyBuyer,
        value: await lock.keyPrice(),
      })
      const transaction = await web3.eth.getTransaction(tx.tx)
    })

    describe('mint by gas price', () => {

    })
    // it('starting supply is NOT 0', async () => {
    //   const totalSupply = await unlockDiscountToken.totalSupply()
    //   assert.equal(totalSupply.eq(0), false)
    //   // more than initial pre-mined 1M
    //   assert(totalSupply.gt(ethers.utils.parseEther('1000000')))
    // })
  })
})
