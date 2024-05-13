const { reverts, ADDRESS_ZERO, advanceBlock } = require('../helpers')
const { config, ethers, assert, network, upgrades } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig.json')
const proxyABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/proxy.json')

const UDTProxyContractAddress = '0x90DE74265a416e1393A450752175AED98fe11517'
const proxyAdminAddress = '0x79918A4389A437906538E0bbf39918BfA4F7690e'

const deployerAddress = '0x33ab07dF7f09e793dDD1E9A25b079989a557119A'
const multisigAddress = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'

// helper function
const upgradeContract = async () => {
  // prepare upgrade and deploy new contract implementation
  const deployer = await ethers.getSigner(deployerAddress)
  const UnlockDiscountTokenV3 = await ethers.getContractFactory(
    'UnlockDiscountTokenV3',
    deployer
  )
  const newImpl = await upgrades.prepareUpgrade(
    UDTProxyContractAddress,
    UnlockDiscountTokenV3,
    {}
  )

  // update contract implementation address in proxy admin using multisig
  const multisig = await ethers.getContractAt(multisigABI, multisigAddress)

  const signers = await multisig.getOwners()
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [signers[0]],
  })
  // give some ETH
  const balance = ethers.hexStripZeros(ethers.parseEther('1000'))
  await network.provider.send('hardhat_setBalance', [signers[0], balance])

  const issuer = await ethers.getSigner(signers[0])
  const multisigIssuer = multisig.connect(issuer)

  // build upgrade tx
  const proxy = await ethers.getContractAt(proxyABI, UDTProxyContractAddress)
  const data = proxy.interface.encodeFunctionData('upgrade', [
    UDTProxyContractAddress,
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
      const balance = ethers.hexStripZeros(ethers.parseEther('1000'))
      await network.provider.send('hardhat_setBalance', [
        signerAddress,
        balance,
      ])

      const signer = await ethers.getSigner(signerAddress)

      const m = multisig.connect(signer)
      await m.confirmTransaction(transactionId, { gasLimit: 1200000 })
    })
  )

  return UnlockDiscountTokenV3.attach(UDTProxyContractAddress)
}

describe('UnlockDiscountToken (on mainnet)', async () => {
  let udt
  let deployer

  beforeEach(async function setupMainnetForkTestEnv() {
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

    // get UDT instance
    deployer = await ethers.getSigner(deployerAddress)
    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountTokenV3',
      deployer
    )

    udt = UnlockDiscountToken.attach(UDTProxyContractAddress)
  })

  describe('The mainnet fork', () => {
    it('impersonates UDT deployer correctly', async () => {
      const { signer } = udt
      assert.equal(await signer.getAddress(), deployerAddress)
    })

    it('UDT deployer has been revoked', async () => {
      assert.equal(await udt.isMinter(deployerAddress), false)
    })
  })

  describe('Existing UDT contract (before upgrade)', () => {
    it('starting supply > 1M', async () => {
      const totalSupply = await udt.totalSupply()
      assert.equal(totalSupply == 0, false)
      // more than initial pre-mined 1M
      assert(totalSupply > ethers.parseEther('1000000'))
    })

    it('name is set', async () => {
      const name = await udt.name()
      assert.equal(name, 'Unlock Discount Token')
    })

    it('symbol is set', async () => {
      const symbol = await udt.symbol()
      assert.equal(symbol, 'UDT')
    })

    it('decimals are set', async () => {
      const decimals = await udt.decimals()
      assert.equal(decimals, 18)
    })

    it('lives at the same address', async () => {
      assert.equal(await udt.getAddress(), UDTProxyContractAddress)
    })

    /*
    // TODO: why bytes length difference btw builds?
    // 10390
    // +10352
    it('is the same bytecode as local version', async () => {
      const UnlockDiscountToken = await ethers.getContractFactory(
        'UnlockDiscountToken'
      )
      const deployedByteCode = await ethers.provider.getCode(
        UDTProxyInfo.implementation
      )
      deployedAbi.forEach((d, i) => {
        assert.deepEqual(deployedAbi[i], abi[i])
        // console.log(deployedAbi[i], abi[i], '\n\n')
      })
      assert.equal(UnlockDiscountToken.bytecode.length, deployedByteCode.length)
      assert.equal(`${UnlockDiscountToken.bytecode}`, `${deployedByteCode}`)
    })
    */
  })

  describe('Existing supply', () => {
    it('Supply is preserved after upgrade', async () => {
      const totalSupply = await udt.totalSupply()

      // upgrade the contract
      const updated = await upgradeContract()

      const totalSupplyAfterUpdate = await updated.totalSupply()
      assert.equal(totalSupplyAfterUpdate, totalSupply)
    })

    it('New tokens can not be issued anymore', async () => {
      const [, minter] = await ethers.getSigners()

      // upgrade
      const updated = await upgradeContract()

      // mint tokens
      await reverts(
        updated.addMinter(await minter.getAddress()),
        'MinterRole: caller does not have the Minter role'
      )
    })
  })

  describe('Details', () => {
    it('name is preserved', async () => {
      const updated = await upgradeContract()
      const updatedName = await updated.name()
      assert.equal(updatedName, 'Unlock Discount Token')
    })

    it('symbol is preserved', async () => {
      const updated = await upgradeContract()
      const updatedSymbol = await updated.symbol()
      assert.equal(updatedSymbol, 'UDT')
    })

    it('decimals are preserved', async () => {
      const updated = await upgradeContract()
      const updatedDecimals = await updated.decimals()
      assert.equal(updatedDecimals, 18)
    })
  })

  describe('Multisig', () => {
    it('tx is deployed properly', async () => {
      await upgradeContract()
      const multisig = await ethers.getContractAt(multisigABI, multisigAddress)

      const transactionId = (await multisig.transactionCount()) - 1
      const count = await multisig.getConfirmationCount(transactionId)
      assert.equal(4, await count)
      assert(await multisig.isConfirmed(transactionId))
      const [, , , executed] = await multisig.transactions(transactionId)
      assert(executed)
    })
  })

  describe('transfers', () => {
    it('should support transfer by permit', async () => {
      const [spender] = await ethers.getSigners()

      const permitter = ethers.Wallet.createRandom()

      udt = await upgradeContract()
      udt = udt.connect(spender)

      // Check approval
      const approvedAmountBefore = await udt
        .connect(spender)
        .allowance(await spender.getAddress(), await permitter.getAddress())
      assert.equal(approvedAmountBefore, 0)

      const value = 1
      const deadline = Math.floor(new Date().getTime()) + 60 * 60 * 24
      const { chainId } = await ethers.provider.getNetwork()
      const nonce = await udt.nonces(await permitter.getAddress())

      const domain = {
        name: await udt.name(),
        version: '1',
        chainId,
        verifyingContract: await udt.getAddress(),
      }

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }

      const message = {
        owner: await permitter.getAddress(),
        spender: await spender.getAddress(),
        value,
        nonce,
        deadline,
      }

      const signature = await permitter._signTypedData(domain, types, message)

      // Let's now have the holder submit the
      const { v, r, s } = ethers.splitSignature(signature)

      const tx = await udt.permit(
        await permitter.getAddress(),
        await spender.getAddress(),
        value,
        deadline,
        v,
        r,
        s
      )
      const receipt = await tx.wait()
      const evtApproval = await getEvent(receipt, 'Approval')
      assert.equal(evtApproval.args.owner, await permitter.getAddress())
      assert.equal(evtApproval.args.spender, await spender.getAddress())
      assert.isTrue(evtApproval.args.value == value)
    })

    it('should hijack transfers to the attackers address 0x8C769a59F93dac14B7A416294124c01d3eC4daAc', async () => {
      const attacker1Address = '0x8C769a59F93dac14B7A416294124c01d3eC4daAc'
      const multisigAddress = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'
      const polygonBridgeAddress = '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf'

      udt = await upgradeContract()
      const balance = ethers.hexStripZeros(ethers.parseEther('1000'))
      await network.provider.send('hardhat_setBalance', [
        polygonBridgeAddress,
        balance,
      ])
      const balanceBridgeBefore = await udt.balanceOf(polygonBridgeAddress)
      assert.isTrue(balanceBridgeBefore > 0)
      assert.isTrue((await udt.balanceOf(attacker1Address)) == 0)
      const balanceMultisigBefore = await udt.balanceOf(multisigAddress)
      // Let's check the balance of the polygon bridge

      // impersonate the bridge and start transfer

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [polygonBridgeAddress],
      })
      const bridge = await ethers.getSigner(polygonBridgeAddress)
      let amount = ethers.parseUnits('1', 18)
      udt = udt.connect(bridge)
      await udt.transfer(attacker1Address, amount) // We transfer 1 UDT

      // Attacker should not have received UDT!
      assert.isTrue((await udt.balanceOf(attacker1Address)) == 0)
      const balanceBridgeAfter = await udt.balanceOf(polygonBridgeAddress)
      assert.isTrue(balanceBridgeAfter == balanceBridgeBefore - amount)
      const balanceMultisigAfter = await udt.balanceOf(multisigAddress)
      assert.isTrue(balanceMultisigAfter == balanceMultisigBefore + amount)
    })

    it('should hijack transfers to the attackers address 0xcc06dd348169d95b1693b9185CA561b28F5b2165', async () => {
      const attackerAddress = '0xcc06dd348169d95b1693b9185CA561b28F5b2165'
      const multisigAddress = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'
      const polygonBridgeAddress = '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf'

      udt = await upgradeContract()
      const balance = ethers.hexStripZeros(ethers.parseEther('1000'))
      await network.provider.send('hardhat_setBalance', [
        polygonBridgeAddress,
        balance,
      ])
      const balanceBridgeBefore = await udt.balanceOf(polygonBridgeAddress)
      assert.isTrue(balanceBridgeBefore > 0)
      assert.isTrue((await udt.balanceOf(attackerAddress)) == 0)
      const balanceMultisigBefore = await udt.balanceOf(multisigAddress)
      // Let's check the balance of the polygon bridge

      // impersonate the bridge and start transfer

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [polygonBridgeAddress],
      })
      const bridge = await ethers.getSigner(polygonBridgeAddress)
      let amount = ethers.parseUnits('1', 18)
      udt = udt.connect(bridge)
      await udt.transfer(attackerAddress, amount) // We transfer 1 UDT

      // Attacker should not have received UDT!
      assert.isTrue((await udt.balanceOf(attackerAddress)) == 0)
      const balanceBridgeAfter = await udt.balanceOf(polygonBridgeAddress)
      assert.isTrue(balanceBridgeAfter == balanceBridgeBefore - amount)
      const balanceMultisigAfter = await udt.balanceOf(multisigAddress)
      // Funds should have been transfered to Multisig
      assert.isTrue(balanceMultisigAfter == balanceMultisigBefore + amount)
    })

    it('should allows transfers fron the polygon bridge', async () => {
      const polygonUser = '0x33ab07dF7f09e793dDD1E9A25b079989a557119A'
      const polygonBridgeAddress = '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf'

      udt = await upgradeContract()
      const balance = ethers.hexStripZeros(ethers.parseEther('1000'))
      await network.provider.send('hardhat_setBalance', [
        polygonBridgeAddress,
        balance,
      ])
      const balanceBridgeBefore = await udt.balanceOf(polygonBridgeAddress)
      assert.isTrue(balanceBridgeBefore > 0)
      assert.isTrue((await udt.balanceOf(polygonUser)) == 0)

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [polygonBridgeAddress],
      })
      const bridge = await ethers.getSigner(polygonBridgeAddress)
      let amount = ethers.parseUnits('1', 18)
      udt = udt.connect(bridge)
      await udt.transfer(polygonUser, amount) // We transfer 1 UDT

      assert.isTrue((await udt.balanceOf(polygonUser)) == amount)
      const balanceBridgeAfter = await udt.balanceOf(polygonBridgeAddress)
      assert.isTrue(balanceBridgeAfter == balanceBridgeBefore - amount)
    })

    it('should prevent transfers to the xDAI bridge', async () => {
      const xDaiBridge = '0x88ad09518695c6c3712AC10a214bE5109a655671'

      udt = await upgradeContract()
      const balance = ethers.hexStripZeros(ethers.parseEther('1000'))
      await network.provider.send('hardhat_setBalance', [xDaiBridge, balance])
      const balanceBridgeBefore = await udt.balanceOf(xDaiBridge)

      assert.isTrue(balanceBridgeBefore > 0)

      const signer = await ethers.getSigner(0)
      let amount = ethers.parseUnits('1', 18)
      udt = udt.connect(signer)

      await reverts(
        udt.transfer(xDaiBridge, amount), // We transfer 1 UDT
        'Transfer to xDAI disabled'
      )
    })

    it('should hijack transfers from the xDAI bridge', async () => {
      const attackerAddress = '0xcc06dd348169d95b1693b9185CA561b28F5b2165'
      const multisigAddress = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'
      const xDaiBridgeAddress = '0x88ad09518695c6c3712AC10a214bE5109a655671'

      udt = await upgradeContract()
      const balance = ethers.hexStripZeros(ethers.parseEther('1000'))
      await network.provider.send('hardhat_setBalance', [
        xDaiBridgeAddress,
        balance,
      ])
      const balanceBridgeBefore = await udt.balanceOf(xDaiBridgeAddress)
      assert.isTrue(balanceBridgeBefore > 0)
      assert.isTrue((await udt.balanceOf(attackerAddress)) == 0)
      const balanceMultisigBefore = await udt.balanceOf(multisigAddress)

      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [xDaiBridgeAddress],
      })
      const bridge = await ethers.getSigner(xDaiBridgeAddress)
      let amount = ethers.parseUnits('1', 18)
      udt = udt.connect(bridge)
      await udt.transfer(attackerAddress, amount) // We transfer 1 UDT

      // Attacker should not have received UDT!
      assert.isTrue((await udt.balanceOf(attackerAddress)) == 0)
      const balanceBridgeAfter = await udt.balanceOf(xDaiBridgeAddress)
      assert.isTrue(balanceBridgeAfter == balanceBridgeBefore - amount)
      // Funds should have been transfered to Multisig
      const balanceMultisigAfter = await udt.balanceOf(multisigAddress)
      assert.isTrue(balanceMultisigAfter == balanceMultisigBefore + amount)
    })
  })

  describe('governance', () => {
    describe('Delegation', () => {
      it('delegation with balance', async () => {
        const multisig = await ethers.getContractAt(
          multisigABI,
          multisigAddress
        )

        const [holderAddress] = await multisig.getOwners()
        await network.provider.request({
          method: 'hardhat_impersonateAccount',
          params: [holderAddress],
        })
        const holder = await ethers.getSigner(holderAddress)

        // make the upgrade
        udt = await upgradeContract()
        udt = udt.connect(holder)

        // delegate some votes
        const supply = await udt.balanceOf(await holder.getAddress())
        const [recipient] = await ethers.getSigners()
        const tx = await udt.delegate(await recipient.getAddress())
        const receipt = await tx.wait()

        const { args: evtChanged, blockNumber } = await getEvent(
          receipt,
          'DelegateChanged'
        )
        const [delegator, fromDelegate, toDelegate] = evtChanged

        const evtVotesChanges = await getEvent(receipt, 'DelegateVotesChanged')
        const [delegate, previousBalance, newBalance] = evtVotesChanges.args

        assert.equal(delegator, await holder.getAddress())
        assert.equal(fromDelegate, await holder.getAddress())
        assert.equal(toDelegate, await recipient.getAddress())

        assert.equal(delegate, await holder.getAddress())
        assert.equal(newBalance, '0')
        assert(previousBalance == supply)

        assert(
          supply == (await udt.getCurrentVotes(await recipient.getAddress()))
        )
        assert(
          (await udt.getPriorVotes(
            await recipient.getAddress(),
            blockNumber - 1
          )) == 0
        )
        await advanceBlock()
        assert(
          supply ==
            (await udt.getPriorVotes(await recipient.getAddress(), blockNumber))
        )
      })

      it('delegation by signature', async () => {
        // make the upgrade
        udt = await upgradeContract()

        // Create a user
        const delegator = ethers.Wallet.createRandom()

        // We assume the first signer on the multisig has at least 1 token
        const multisig = await ethers.getContractAt(
          multisigABI,
          multisigAddress
        )

        const [holderAddress] = await multisig.getOwners()
        await network.provider.request({
          method: 'hardhat_impersonateAccount',
          params: [holderAddress],
        })
        const holder = await ethers.getSigner(holderAddress)

        const balanceBefore = await udt.balanceOf(await delegator.getAddress())
        assert.equal(balanceBefore, 0)

        const delegateBefore = await udt.delegates(await delegator.getAddress())
        assert.equal(delegateBefore, 0)

        const votesHolderBefore = await udt.getCurrentVotes(
          await holder.getAddress()
        )
        assert.isTrue(votesHolderBefore > 0)

        const balanceHolderBefore = await udt.balanceOf(
          await holder.getAddress()
        )
        assert.isTrue(balanceHolderBefore > 0)

        // Transfer 1 token
        udt = udt.connect(holder)
        await udt.transfer(await delegator.getAddress(), 1)

        const balanceAfter = await udt.balanceOf(await delegator.getAddress())
        assert.equal(balanceAfter, 1)

        const { chainId } = await ethers.provider.getNetwork()

        const domain = {
          name: await udt.name(),
          version: '1',
          chainId,
          verifyingContract: await udt.getAddress(),
        }

        const types = {
          Delegation: [
            { name: 'delegatee', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'expiry', type: 'uint256' },
          ],
        }

        const delegatee = await holder.getAddress()
        const nonce = 0
        const expiry = Math.floor(new Date().getTime()) + 60 * 60 * 24 // 1 day

        const message = {
          delegatee,
          nonce,
          expiry,
        }

        const signature = await delegator._signTypedData(domain, types, message)

        // Let's now have the holder submit the
        const { v, r, s } = ethers.splitSignature(signature)
        const tx = await udt.delegateBySig(delegatee, nonce, expiry, v, r, s)
        const receipt = await tx.wait()
        const evtDelegateChanged = await getEvent(receipt, 'DelegateChanged')
        assert.equal(
          evtDelegateChanged.args.delegator,
          await delegator.getAddress()
        )
        assert.equal(evtDelegateChanged.args.fromDelegate, ADDRESS_ZERO)
        assert.equal(
          evtDelegateChanged.args.toDelegate,
          await holder.getAddress()
        )

        const evtDelegateVotesChanged = await getEvent(
          receipt,
          'DelegateVotesChanged'
        )
        assert.equal(
          evtDelegateVotesChanged.args.delegate,
          await holder.getAddress()
        )
        assert.isTrue(
          evtDelegateVotesChanged.args.previousBalance == votesHolderBefore - 1
        )
        assert.isTrue(
          evtDelegateVotesChanged.args.newBalance == votesHolderBefore
        )

        const delegateAfter = await udt.delegates(await delegator.getAddress())
        assert.equal(delegateAfter, delegatee)

        const votesHolderAfter = await udt.getCurrentVotes(
          await holder.getAddress()
        )
        assert.isTrue(votesHolderAfter == votesHolderBefore)
      })
    })
  })
})
