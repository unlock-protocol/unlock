const { ethers } = require('hardhat')
const {
  encodeProposalArgs,
  decodeProposalArgs,
  parseProposal,
  getProposalId,
  getProposalIdFromContract,
} = require('../helpers/gov')

const { deployContracts } = require('./helpers')

const tokenRecipientAddress = '0x8d533d1A48b0D5ddDEF513A0B0a3677E991F3915' // ramdomly generated but deterministic for tests

const contractName = 'UnlockDiscountTokenV3'
const functionName = 'transfer'
const functionArgs = [
  tokenRecipientAddress,
  ethers.utils.parseUnits('0.01', 18),
]

const calldataEncoded =
  '0xa9059cbb0000000000000000000000008d533d1a48b0d5dddef513a0b0a3677e991f3915000000000000000000000000000000000000000000000000002386f26fc10000'

contract('Proposal Helper', () => {
  describe('calldata args encoder', () => {
    it('encode correctly a function call', async () => {
      const encoded = await encodeProposalArgs({
        contractName,
        functionName,
        functionArgs,
      })
      assert.equal(encoded, calldataEncoded)
    })
  })

  describe('calldata args decoder', () => {
    it('encode correctly a function call', async () => {
      const decoded = await decodeProposalArgs({
        contractName,
        functionName,
        calldata: calldataEncoded,
      })

      assert.equal(decoded[0], functionArgs[0])
      assert.equal(decoded[1].toString(), functionArgs[1].toString())
    })
  })

  describe('proposal parser', () => {
    it('parse gov args correctly', async () => {
      await deployContracts()
      const {
        udt: { address },
      } = await deployContracts()
      const proposalName = 'Send some tokens to a grantee'

      const encoded = await encodeProposalArgs({
        contractName,
        functionName,
        functionArgs,
      })

      const [to, value, calldata, proposalNameParsed] = await parseProposal({
        contractName,
        calldata: encoded,
        proposalName,
      })

      assert.equal(to[0], address)
      assert.equal(value[0], 0)
      assert.equal(calldata[0], [calldataEncoded])
      assert.equal(proposalNameParsed, proposalName)
    })
  })

  describe('proposal ID', () => {
    it('can be retrieved', async () => {
      // eslint-disable-next-line global-require
      const proposalExample = require('../proposals/000-example')
      const proposalId = await getProposalId(proposalExample)
      const proposalIdFromContract = await getProposalIdFromContract(
        proposalExample
      )
      assert.equal(proposalId.toString(), proposalIdFromContract.toString())
    })
  })
})
