const {
  GovernorUnlockProtocol,
  GovernorUnlockProtocolTimelock,
} = require('@unlock-protocol/contracts')
const { ethers } = require('hardhat')
const assert = require('assert')
const {
  encodeProposalArgs,
  decodeProposalArgs,
  loadProposal,
  parseProposal,
  getProposalId,
  getProposalIdFromContract,
  submitProposal,
  getProposalArgsFromTx,
} = require('../helpers/gov')

const tokenRecipientAddress = '0x8d533d1A48b0D5ddDEF513A0B0a3677E991F3915' // ramdomly generated but deterministic for tests
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')

const contractNameOrAbi = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')
const functionName = 'transfer'
const functionArgs = [tokenRecipientAddress, ethers.parseEther('0.01')]

const calldataEncoded =
  '0xa9059cbb0000000000000000000000008d533d1a48b0d5dddef513a0b0a3677e991f3915000000000000000000000000000000000000000000000000002386f26fc10000'

describe('Proposal Helper', () => {
  describe('calldata args encoder', () => {
    it('encode correctly a function call', async () => {
      const encoded = await encodeProposalArgs({
        contractNameOrAbi,
        functionName,
        functionArgs,
      })
      assert.equal(encoded, calldataEncoded)
    })
  })

  describe('calldata args decoder', () => {
    it('decode correctly a function call', async () => {
      const decoded = await decodeProposalArgs({
        contractNameOrAbi,
        functionName,
        calldata: calldataEncoded,
      })

      assert.equal(decoded[0], functionArgs[0])
      assert.equal(decoded[1].toString(), functionArgs[1].toString())
    })
  })

  describe('parseProposal', () => {
    it('parse gov args correctly', async () => {
      const contractAddress = ADDRESS_ZERO
      const proposalName = 'Send some tokens to a grantee'

      const encoded = await encodeProposalArgs({
        contractNameOrAbi,
        functionName,
        functionArgs,
      })

      const { targets, values, calldatas, descriptionHash } =
        await parseProposal({
          calls: [{ contractNameOrAbi, contractAddress, calldata: encoded }],
          proposalName,
        })

      const proposalNameHashed = ethers.keccak256(
        ethers.toUtf8Bytes(proposalName)
      )

      assert.equal(targets[0], ADDRESS_ZERO)
      assert.equal(values[0], 0)
      assert.equal(calldatas[0], [calldataEncoded])
      assert.equal(descriptionHash, proposalNameHashed)
    })
  })

  describe('proposal ID', () => {
    it('can be retrieved from chain', async () => {
      const proposalExample = await loadProposal(
        '../test/fixtures/proposal-000-example.js'
      )
      const proposalId = await getProposalId(proposalExample)
      const { abi, bytecode } = GovernorUnlockProtocol
      const Gov = await ethers.getContractFactory(abi, bytecode)
      const gov = await Gov.deploy()
      const proposalIdFromContract = await getProposalIdFromContract({
        proposal: proposalExample,
        govAddress: await gov.getAddress(),
      })
      assert.equal(proposalId.toString(), proposalIdFromContract.toString())
    })
  })
})
