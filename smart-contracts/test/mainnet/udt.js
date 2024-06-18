const assert = require('assert')
const { ethers } = require('hardhat')
const {
  reverts,
  ADDRESS_ZERO,
  getProxyAddress,
  advanceBlock,
} = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const {
  resetNodeState,
  impersonate,
  MULTISIG_ADDRESS_OWNER,
} = require('../helpers')

describe('UnlockDiscountToken on mainnet', async () => {
  let udt
  const chainId = 1 // mainnet
  let unlockAddress

  beforeEach(async function setupMainnetForkTestEnv() {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // reset fork
    await resetNodeState()

    // prepare proxy info
    const proxyAddress = getProxyAddress(chainId, 'UnlockDiscountTokenV3')
    // const proxyAdmin = getProxyAdminAddress({ network })
    // await impersonate(proxyAdmin)

    // mocha settings
    this.timeout(200000)

    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountTokenV3'
    )
    const [, minter] = await ethers.getSigners()
    udt = await UnlockDiscountToken.attach(proxyAddress).connect(minter)

    unlockAddress = getProxyAddress(chainId, 'Unlock')
  })

  describe('ERC20 details', () => {
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
  })

  describe('mint', () => {
    const amount = ethers.hexStripZeros(ethers.parseEther('1000'))

    it('minters can not be added anymore', async () => {
      const [, minter] = await ethers.getSigners()
      await reverts(
        udt.addMinter(await minter.getAddress()),
        'MinterRole: caller does not have the Minter role'
      )
    })
    it('random accounts can not mint', async () => {
      const [, , , , lambda] = await ethers.getSigners()
      const recipient = await ethers.Wallet.createRandom()

      await reverts(
        udt.connect(lambda).mint(await recipient.getAddress(), amount),
        'MinterRole: caller does not have the Minter role'
      )
    })
    describe('the Unlock contract', () => {
      it('is declared as minter', async () => {
        assert.equal(await udt.isMinter(unlockAddress), true)
      })
      it('can mint', async () => {
        const recipient = await ethers.Wallet.createRandom()

        await impersonate(unlockAddress)
        const unlock = await ethers.getSigner(unlockAddress)
        const tx = await udt
          .connect(unlock)
          .mint(await recipient.getAddress(), amount)

        const receipt = await tx.wait()
        const { args } = await getEvent(receipt, 'Transfer')

        assert.equal(args.from, ADDRESS_ZERO)
        assert.equal(args.to, await recipient.getAddress())
        assert.equal(args.value == amount, true)
      })
    })
  })

  describe('burn', () => {
    it('function does not exist', async () => {
      assert.equal(udt.burn, null)
      assert.equal(Object.keys(udt).includes('burn'), false)
      assert.equal(Object.keys(udt.functions).includes('burn'), false)
      assert.equal(Object.keys(udt.functions).includes('burn()'), false)
    })
  })

  describe('supply', () => {
    it('is more than 1M', async () => {
      const totalSupply = await udt.totalSupply()
      assert.equal(
        totalSupply > 0,
        true,
        'starting supply must be different from 0'
      )
      // more than 1M
      assert(totalSupply > ethers.parseEther('1000000'))
    })

    // totalSupply at block height for ERC20Votes function
    describe('pastTotalSupply', async () => {
      it('corresponds to latest totalSupply', async () => {
        const blockNumber = await ethers.provider.getBlockNumber()
        await advanceBlock()
        const pastTotalSupply = await udt.getPastTotalSupply(blockNumber)
        const totalSupply = await udt.totalSupply()
        assert.isTrue(pastTotalSupply == totalSupply)
      })
      it('increases when tokens are minted', async () => {
        const amount = ethers.hexStripZeros(ethers.parseEther('1000'))
        const blockNumber = await ethers.provider.getBlockNumber()
        await advanceBlock()
        const pastTotalSupply = await udt.getPastTotalSupply(blockNumber)

        // mint some tokens
        const recipient = await ethers.Wallet.createRandom()
        await impersonate(unlockAddress)
        const unlock = await ethers.getSigner(unlockAddress)
        const tx = await udt
          .connect(unlock)
          .mint(await recipient.getAddress(), amount)
        const receipt = await tx.wait()
        await advanceBlock()

        const pastTotalSupplyAfter = await udt.getPastTotalSupply(
          receipt.blockNumber
        )
        assert.isTrue(pastTotalSupplyAfter == pastTotalSupply + amount)
      })
    })
  })

  describe('transfers', () => {
    let holder
    beforeEach(async () => {
      await impersonate(MULTISIG_ADDRESS_OWNER)
      holder = await ethers.getSigner(MULTISIG_ADDRESS_OWNER)
    })
    it('should support simple transfer of tokens', async () => {
      const amount = 1
      const recipient = await ethers.Wallet.createRandom()
      await udt.connect(holder).transfer(await recipient.getAddress(), amount)

      const balanceAfter = await udt.balanceOf(await recipient.getAddress())
      assert.equal(balanceAfter, amount)
    })
    it('should support allowance/transferFrom', async () => {
      const amount = 1
      const [spender] = await ethers.getSigners()
      const recipient = await ethers.Wallet.createRandom()

      const allowanceBefore = await udt.allowance(
        await holder.getAddress(),
        await spender.getAddress()
      )
      assert.equal(allowanceBefore, 0)

      // allow
      await udt.connect(holder).approve(await spender.getAddress(), amount)
      const allowance = await udt.allowance(
        await holder.getAddress(),
        await spender.getAddress()
      )
      assert.equal(allowance, amount)

      // transfer
      await udt
        .connect(spender)
        .transferFrom(
          await holder.getAddress(),
          await recipient.getAddress(),
          amount
        )

      const balanceAfter = await udt.balanceOf(await recipient.getAddress())
      assert.equal(balanceAfter, amount)

      const allowanceAfter = await udt.allowance(
        await holder.getAddress(),
        await recipient.getAddress()
      )
      assert.equal(allowanceAfter, 0)
    })

    it('should support transfer by permit', async () => {
      const [spender] = await ethers.getSigners()
      const permitter = ethers.Wallet.createRandom()

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
  })

  describe('governance', () => {
    // We assume that multisig signer has at least 1 UDT token
    let holder
    beforeEach(async () => {
      await impersonate(MULTISIG_ADDRESS_OWNER)
      holder = await ethers.getSigner(MULTISIG_ADDRESS_OWNER)
    })
    describe('Delegation', () => {
      it('delegation with balance', async () => {
        // a holder directly interact w udt
        udt = udt.connect(holder)

        // delegate some votes
        const supply = await udt.balanceOf(await holder.getAddress())
        const [recipient] = await ethers.getSigners()
        const tx = await udt.delegate(await recipient.getAddress())
        const receipt = await tx.wait()

        const { args, blockNumber } = await getEvent(receipt, 'DelegateChanged')
        const { delegator, fromDelegate, toDelegate } = args

        const { args: evtVotesChanges } = await getEvent(
          receipt,
          'DelegateVotesChanged'
        )
        const { delegate, previousBalance, newBalance } = evtVotesChanges

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
        // Create a user
        const delegator = ethers.Wallet.createRandom()

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

  describe('domain separator', () => {
    it('is set correctly', async () => {
      const expectedDomain = {
        name: await udt.name(),
        version: '1',
        chainId: await udt.provider.getNetwork().then(({ chainId }) => chainId),
        verifyingContract: await udt.getAddress(),
      }

      const domainSeparator = await udt.DOMAIN_SEPARATOR()
      assert.equal(
        domainSeparator,
        ethers._TypedDataEncoder.hashDomain(expectedDomain)
      )
    })
  })
})
