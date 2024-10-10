const { config, ethers, assert, network, upgrades } = require('hardhat')
const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig.json')
const proxyABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/proxy.json')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')
const { mainnet } = require('@unlock-protocol/networks')
const { ADDRESS_ZERO, getProxyAdminAddress } = require('../helpers')

// NB : this needs to be run against a mainnet fork using
// import proxy info using legacy OZ CLI file export after migration to @openzepplein/upgrades
const { unlockAddress: ProxyContractAddress } = mainnet // '0x90DE74265a416e1393A450752175AED98fe11517'
const proxyAdminAddress = getProxyAdminAddress // '0x79918A4389A437906538E0bbf39918BfA4F7690e'

const deployerAddress = '0x33ab07dF7f09e793dDD1E9A25b079989a557119A'
const multisigAddress = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'
const recipient = '0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44'
const referrer = '0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44'

// helper function
const upgradeContract = async () => {
  // prepare upgrade and deploy new contract implementation
  const deployer = await ethers.getSigner(deployerAddress)
  const Unlock = await ethers.getContractFactory('Unlock', deployer)
  const newImpl = await upgrades.prepareUpgrade(
    ProxyContractAddress,
    Unlock,
    {}
  )

  // update contract implementation address in proxy admin using multisig
  const multisig = await ethers.getContractAt(multisigABI, multisigAddress)

  const signers = await multisig.getOwners()
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [signers[0]],
  })
  const issuer = await ethers.getSigner(signers[0])
  const multisigIssuer = multisig.connect(issuer)

  // build upgrade tx
  const proxy = await ethers.getContractAt(proxyABI, ProxyContractAddress)
  const data = proxy.interface.encodeFunctionData('upgrade', [
    ProxyContractAddress,
    newImpl,
  ])

  // submit proxy upgrade tx
  const tx = await multisigIssuer.submitTransaction(
    proxyAdminAddress,
    0, // ETH value
    data
  )

  // get tx id
  const receipt = await tx.wait()
  const evt = await getEvent(receipt, 'Confirmation')
  const transactionId = evt.args[1]

  // reach concensus
  await Promise.all(
    signers.slice(1, 4).map(async (signerAddress) => {
      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [signerAddress],
      })

      const signer = await ethers.getSigner(signerAddress)

      const m = multisig.connect(signer)
      await m.confirmTransaction(transactionId, { gasLimit: 1200000 })
    })
  )

  return Unlock.attach(ProxyContractAddress)
}

describe('Unlock (on mainnet)', async () => {
  let unlock
  let deployer

  before(async function setupMainnetForkTestEnv() {
    this.timeout(2000000)

    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // reset fork
    const { forking } = config.networks.hardhat
    await network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: forking.url,
            blockNumber: forking.blockNumber,
          },
        },
      ],
    })

    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [deployerAddress],
    })

    // give some ETH to deployer
    const balance = ethers.hexStripZeros(ethers.parseEther('1000'))
    await network.provider.send('hardhat_setBalance', [
      deployerAddress,
      balance,
    ])

    // get Unlock instance
    deployer = await ethers.getSigner(deployerAddress)
    const Unlock = await ethers.getContractFactory('Unlock', deployer)

    unlock = Unlock.attach(ProxyContractAddress)
  })

  describe('The mainnet fork', () => {
    it('impersonates unlock deployer correctly', async () => {
      const { signer } = unlock
      assert.equal(await signer.getAddress(), deployerAddress)
    })
  })

  describe('Unlock contract', () => {
    it('has persisted data', async () => {
      const globalTokenSymbolBefore = await unlock.globalTokenSymbol()
      const globalBaseTokenURIBefore = await unlock.globalBaseTokenURI()
      const grossNetworkProductBefore = await unlock.grossNetworkProduct()
      const udtBefore = await unlock.governanceToken()
      const wethBefore = await unlock.weth()
      const publicLockAddressBefore = await unlock.publicLockAddress()
      const estimatedGasForPurchaseBefore =
        await unlock.estimatedGasForPurchase()

      const updated = await upgradeContract()
      const globalTokenSymbolAfter = await updated.globalTokenSymbol()
      const globalBaseTokenURIAfter = await updated.globalBaseTokenURI()
      const grossNetworkProductAfter = await updated.grossNetworkProduct()
      const udtAfter = await updated.governanceToken()
      const wethAfter = await updated.weth()
      const publicLockAddressAfter = await updated.publicLockAddress()
      const estimatedGasForPurchaseAfter =
        await updated.estimatedGasForPurchase()
      assert.equal(globalTokenSymbolBefore, globalTokenSymbolAfter)
      assert.equal(globalBaseTokenURIBefore, globalBaseTokenURIAfter)
      assert.equal(grossNetworkProductBefore == grossNetworkProductAfter, true)
      assert.equal(udtBefore, udtAfter)
      assert.equal(wethBefore, wethAfter)
      assert.equal(publicLockAddressBefore, publicLockAddressAfter)
      assert.equal(
        estimatedGasForPurchaseBefore == estimatedGasForPurchaseAfter,
        true
      )
    })

    it('deploys a lock and purchases a key!', async () => {
      const updated = await upgradeContract()
      let tx = await updated.createLock(
        60, // expirationDuration: 1 minute!
        ADDRESS_ZERO,
        0, // keyPrice: in wei
        100, // maxNumberOfKeys
        'Upgrade Test Lock',
        '0x000000000000000000000000'
      )
      const receipt = await tx.wait()
      const evt = await getEvent(receipt, 'NewLock')

      const PublicLock = await ethers.getContractFactory(
        'contracts/PublicLock.sol:PublicLock',
        deployer
      )
      let publicLock = await PublicLock.attach(evt.args.newLockAddress)

      const expirationBefore =
        await publicLock.keyExpirationTimestampFor(recipient)
      assert(expirationBefore == 0)

      let purchaseTx = await publicLock.purchase(
        [],
        recipient,
        referrer,
        ADDRESS_ZERO,
        []
      )
      await purchaseTx.wait()

      const expirationAfter =
        await publicLock.keyExpirationTimestampFor(recipient)

      assert(expirationAfter > 0)
    })
  })
})
