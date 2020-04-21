const { constants, protocols } = require('hardlydifficult-ethereum-contracts')
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
    hookContract = await CodeRequiredHook.new({
      from: lockCreator,
    })
    await hookContract.addCodes(lock.address, [answerAccount.address], {
      from: lockCreator,
    })

    // Register the hook
    await lock.setEventHooks(hookContract.address, constants.ZERO_ADDRESS, {
      from: lockCreator,
    })
  })

  it('non lock managers cannot add codes', async () => {
    await reverts(
      hookContract.addCodes(lock.address, [constants.ZERO_ADDRESS]),
      'ONLY_LOCK_MANAGER'
    )
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

  describe('can remove codes', () => {
    beforeEach(async () => {
      await hookContract.removeCodes(lock.address, [answerAccount.address], {
        from: lockCreator,
      })
    })

    it('cannot buy even with the previous code', async () => {
      const messageToSign = web3.utils.keccak256(
        web3.eth.abi.encodeParameters(['address'], [keyBuyer])
      )
      const signature = (await answerAccount.sign(messageToSign)).signature
      await reverts(
        lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, signature, {
          from: keyBuyer,
        }),
        'INCORRECT_CODE'
      )
    })
  })

  describe('uninstall hook', () => {
    beforeEach(async () => {
      await lock.setEventHooks(constants.ZERO_ADDRESS, constants.ZERO_ADDRESS, {
        from: lockCreator,
      })
    })

    it('can now buy without the answer', async () => {
      await lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, [], {
        from: keyBuyer,
      })
    })
  })
})
