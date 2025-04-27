const { ethers } = require('hardhat')
const { GovernorUnlockProtocol } = require('@unlock-protocol/contracts')
const assert = require('assert')
const {
  encodeProposalArgs,
  parseProposal,
  getProposalId,
  getProposalIdFromContract,
  loadProposal,
} = require('../helpers/gov')

describe('Proposal: 008-apebond-liquidity', () => {
  let proposal, gov
  const bondTreasuryAddress = '0xa7865ECE6DAB013E7131983b943c2c75D7Fa0D1F'
  const upTokenAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'

  before(async () => {
    const Governor = await ethers.getContractFactory(
      GovernorUnlockProtocol.abi,
      GovernorUnlockProtocol.bytecode
    )
    gov = await Governor.deploy()
    await gov.waitForDeployment()

    proposal = await loadProposal('../test/fixtures/proposal-001-apebond.js')
  })

  describe('Proposal validation', () => {
    it('should load the proposal correctly', async () => {
      assert.ok(proposal, 'Proposal not loaded correctly')
      assert.ok(proposal.proposalName, 'Proposal name not defined')
      assert.ok(
        proposal.calls && proposal.calls.length > 0,
        'Proposal calls not defined'
      )
    })

    it('should have the correct UPToken address', async () => {
      const call = proposal.calls[0]
      assert.equal(
        call.contractAddress,
        upTokenAddress,
        'Token address does not match'
      )
    })

    it('should have the correct bond treasury address', async () => {
      const call = proposal.calls[0]
      assert.equal(
        call.functionArgs[0],
        bondTreasuryAddress,
        'Bond treasury address does not match'
      )
    })

    it('should have the correct function name', async () => {
      const call = proposal.calls[0]
      assert.equal(
        call.functionName,
        'transfer',
        'Function name does not match'
      )
    })
  })

  describe('Proposal execution simulation', () => {
    it('should encode the transfer call correctly', async () => {
      const call = proposal.calls[0]
      const encoded = await encodeProposalArgs({
        contractNameOrAbi: call.contractNameOrAbi,
        functionName: call.functionName,
        functionArgs: call.functionArgs,
      })

      const erc20Interface = new ethers.Interface(call.contractNameOrAbi)
      const manualEncoding = erc20Interface.encodeFunctionData(
        call.functionName,
        call.functionArgs
      )

      assert.equal(
        encoded,
        manualEncoding,
        'Encoded data does not match expected'
      )
    })

    it('should parse proposal for governance correctly', async () => {
      const { targets, values, calldatas, descriptionHash } =
        await parseProposal(proposal)

      assert.equal(targets.length, 1, 'Should have 1 target')
      assert.equal(targets[0], upTokenAddress, 'Target address does not match')
      assert.equal(values[0], 0, 'Value should be 0')
      assert.ok(calldatas[0], 'Calldata should be defined')
      assert.ok(descriptionHash, 'Description hash should be defined')
    })

    it('should generate a valid proposal ID', async () => {
      const proposalId = await getProposalId(proposal)
      assert.ok(proposalId, 'Proposal ID should be defined')

      const govAddress = await gov.getAddress()
      const proposalIdFromContract = await getProposalIdFromContract({
        proposal,
        govAddress,
      })
      assert.equal(
        proposalId.toString(),
        proposalIdFromContract.toString(),
        'Proposal IDs do not match'
      )
    })

    it('should verify the proposal description matches the expected format', async () => {
      assert.ok(
        proposal.proposalName.includes(
          'Transfer Additional UP Tokens to ApeBond Treasury Address'
        ),
        'Proposal name should mention the purpose'
      )

      assert.ok(
        proposal.proposalName.includes('$40,000'),
        'Proposal name should mention the total value'
      )
    })
  })
})
