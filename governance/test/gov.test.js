const { GovernorUnlockProtocol } = require('@unlock-protocol/contracts')
const { ethers } = require('hardhat')
const { assert } = require('chai')
const {
  encodeProposalArgs,
  decodeProposalArgs,
  loadProposal,
  parseProposal,
  getProposalId,
  getProposalIdFromContract,
} = require('../helpers/gov')

const tokenRecipientAddress = '0x8d533d1A48b0D5ddDEF513A0B0a3677E991F3915' // ramdomly generated but deterministic for tests

const contractNameOrAbi = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')
const functionName = 'transfer'
const functionArgs = [
  tokenRecipientAddress,
  ethers.utils.parseUnits('0.01', 18),
]

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
      const contractAddress = ethers.constants.AddressZero
      const proposalName = 'Send some tokens to a grantee'

      const encoded = await encodeProposalArgs({
        contractNameOrAbi,
        functionName,
        functionArgs,
      })

      const [to, value, calldata, proposalNameParsed] = await parseProposal({
        calls: [{ contractNameOrAbi, contractAddress, calldata: encoded }],
        proposalName,
      })

      assert.equal(to[0], contractAddress)
      assert.equal(value[0], 0)
      assert.equal(calldata[0], [calldataEncoded])
      assert.equal(proposalNameParsed, proposalName)
    })
  })

  describe('proposal ID', () => {
    it('can be retrieved', async () => {
      const proposalExample = await loadProposal(
        '../test/fixtures/proposal-000-example.js'
      )
      const proposalId = await getProposalId(proposalExample)
      const { abi, bytecode } = GovernorUnlockProtocol
      const Gov = await ethers.getContractFactory(abi, bytecode)
      const gov = await Gov.deploy()
      const proposalIdFromContract = await getProposalIdFromContract(
        proposalExample,
        gov.address
      )
      assert.equal(proposalId.toString(), proposalIdFromContract.toString())
    })
  })
})
