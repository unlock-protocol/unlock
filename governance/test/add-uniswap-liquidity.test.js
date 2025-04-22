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

describe('Proposal: 009-add-uniswap-liquidity', () => {
  let proposal, gov
  const wethAddress = '0x4200000000000000000000000000000000000006'
  const upTokenAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'
  const positionManagerAddress = '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1'

  before(async () => {
    const Governor = await ethers.getContractFactory(
      GovernorUnlockProtocol.abi,
      GovernorUnlockProtocol.bytecode
    )
    gov = await Governor.deploy()
    await gov.waitForDeployment()

    proposal = await loadProposal(
      '../test/fixtures/proposal-002-uniswap-liquidity.js'
    )
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
      const upCall = proposal.calls[2]
      assert.equal(
        upCall.contractAddress,
        upTokenAddress,
        'UP token address does not match'
      )
    })

    it('should have the correct WETH address', async () => {
      const wethCall = proposal.calls[0]
      assert.equal(
        wethCall.contractAddress,
        wethAddress,
        'WETH address does not match'
      )
    })

    it('should have the correct position manager address', async () => {
      const mintCall = proposal.calls[3]
      assert.equal(
        mintCall.contractAddress,
        positionManagerAddress,
        'Position Manager address does not match'
      )
    })

    it('should have the correct function name', async () => {
      const mintCall = proposal.calls[3]
      assert.equal(
        mintCall.functionName,
        'mint',
        'Function name does not match'
      )
    })
  })

  describe('Proposal execution simulation', () => {
    it('should encode the mint call correctly', async () => {
      const mintCall = proposal.calls[3]
      const encoded = await encodeProposalArgs({
        contractNameOrAbi: mintCall.contractNameOrAbi,
        functionName: mintCall.functionName,
        functionArgs: mintCall.functionArgs,
      })

      const positionManagerInterface = new ethers.Interface(
        mintCall.contractNameOrAbi
      )
      const manualEncoding = positionManagerInterface.encodeFunctionData(
        mintCall.functionName,
        mintCall.functionArgs
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

      assert.equal(targets.length, 4, 'Should have 4 targets')
      assert.equal(
        targets[0],
        wethAddress,
        'First target address does not match'
      )
      assert.equal(
        values[0].toString(),
        proposal.calls[0].value.toString(),
        'First value should match ETH_AMOUNT'
      )
      assert.ok(calldatas[0], 'First calldata should be defined')
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
        proposal.proposalName.includes('Add Liquidity to UP/WETH Uniswap Pool'),
        'Proposal name should mention the purpose'
      )

      assert.ok(
        proposal.proposalName.includes('10 ETH'),
        'Proposal name should mention the ETH amount'
      )
    })
  })
})
