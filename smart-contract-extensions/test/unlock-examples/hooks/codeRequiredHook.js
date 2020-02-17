const { constants, protocols } = require('hardlydifficult-ethereum-contracts')
const erc1820 = require('erc1820')
const { reverts } = require('truffle-assertions')

const CodeRequiredHook = artifacts.require('CodeRequiredHook.sol')

contract('CodeRequiredHook', accounts => {
  const lockCreator = accounts[1]
  const keyBuyer = accounts[5]
  let lock
  let hookContract
  // Never expose the answer or its PK directly in JS for any integrations
  // Only the answer account's address can safely be exposed
  let answerAccount

  beforeEach(async () => {
    // Ganache only setup (a no-op if erc1820 already exists)
    await erc1820.deploy(web3)

    // Create a free lock
    lock = await protocols.unlock.createTestLock(web3, {
      keyPrice: '0',
      from: lockCreator,
    })

    // Calculate the answer account
    const answer = 'super secret hard to guess answer goes here'
    const answerPK = web3.eth.abi.encodeParameters(
      ['address', 'bytes32'],
      // By including the lock address in the answerPK, we can have
      // answers reused for multiple locks without that being visible on-chain
      [lock.address, web3.utils.keccak256(answer)]
    )
    answerAccount = web3.eth.accounts.privateKeyToAccount(answerPK)

    // Create the hook contract with that answer
    hookContract = await CodeRequiredHook.new(answerAccount.address, {
      from: lockCreator,
    })

    // Change the beneficiary to the hook to enable it
    await lock.updateBeneficiary(hookContract.address, { from: lockCreator })
  })

  it('can buy if you know the answer', async () => {
    const messageToSign = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(['address'], [keyBuyer])
    )
    const signature = (await answerAccount.sign(messageToSign)).signature
    await lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, signature, {
      from: keyBuyer,
    })
  })

  it('can not buy with no answer provided', async () => {
    await reverts(
      lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, [], {
        from: keyBuyer,
      }),
      'INCORRECT_CODE'
    )
  })

  it('can not buy with an incorrect answer provided', async () => {
    // Calculate an incorrect answer
    const answer = 'WRONG'
    const answerPK = web3.eth.abi.encodeParameters(
      ['address', 'bytes32'],
      // By including the lock address in the answerPK, we can have
      // answers reused for multiple locks without that being visible on-chain
      [lock.address, web3.utils.keccak256(answer)]
    )
    const wrongAnswerAccount = web3.eth.accounts.privateKeyToAccount(answerPK)
    const messageToSign = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(['address'], [keyBuyer])
    )
    const signature = (await wrongAnswerAccount.sign(messageToSign)).signature
    await reverts(
      lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, signature, {
        from: keyBuyer,
      }),
      'INCORRECT_CODE'
    )
  })

  describe('uninstall hook', () => {
    beforeEach(async () => {
      const callData = lock.contract.methods
        .updateBeneficiary(lockCreator)
        .encodeABI()
      await hookContract.proxyCall(lock.address, callData, {
        from: lockCreator
      })
    })

    it('can now buy without the answer', async () => {
      await lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, [], {
        from: keyBuyer,
      })
    })
  })

  it('non-admins cannot call proxyCall', async () => {
    const callData = lock.contract.methods
      .updateBeneficiary(lockCreator)
      .encodeABI()
    await reverts(
      hookContract.proxyCall(lock.address, callData, { from: accounts[0] }),
      'WhitelistAdminRole: caller does not have the WhitelistAdmin role'
    )
  })
})
