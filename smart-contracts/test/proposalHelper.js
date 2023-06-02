const { ethers } = require('hardhat')
const {
  encodeProposalArgs,
  decodeProposalArgs,
  loadProposal,
  parseProposal,
  getProposalId,
  getProposalIdFromContract,
} = require('../helpers/gov')

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
  let gov
  before(async () => {
    // 5. deploy Gov
    const Governor = await ethers.getContractFactory('UnlockProtocolGovernor')
    gov = await Governor.deploy()
    await gov.deployed()
  })
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

  describe('parseProposal', () => {
    it('parse gov args correctly', async () => {
      const contractAddress = gov.address
      const proposalName = 'Send some tokens to a grantee'

      const encoded = await encodeProposalArgs({
        contractName,
        functionName,
        functionArgs,
      })

      const [to, value, calldata, proposalNameParsed] = await parseProposal({
        calls: [{ contractName, contractAddress, calldata: encoded }],
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
      const proposalExample = await loadProposal('../proposals/000-example')
      const proposalId = await getProposalId(proposalExample)
      const proposalIdFromContract = await getProposalIdFromContract(
        proposalExample,
        gov.address
      )
      assert.equal(proposalId.toString(), proposalIdFromContract.toString())
    })
  })
})
