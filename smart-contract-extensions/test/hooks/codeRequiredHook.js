const { constants, protocols } = require('hardlydifficult-eth')
const { reverts } = require('truffle-assertions')

const CodeRequiredHook = artifacts.require('CodeRequiredHook.sol')

contract('CodeRequiredHook', accounts => {
  const lockCreator = accounts[1]
  const keyBuyer = accounts[5]
  let lock
  let hookContract
  // Never expose the code or its PK directly in JS for any integrations
  // Only the code account's address can safely be exposed
  let codeAccount

  beforeEach(async () => {
    // Create a free lock
    lock = await protocols.unlock.createTestLock(web3, {
      keyPrice: '0',
      from: lockCreator,
    })

    // Calculate the code account
    const code = 'super secret hard to guess code goes here'

    const codePK = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
      ['address', 'bytes32'],
      // By including the lock address in the codePK, we can have
      // codes reused for multiple locks without that being visible on-chain
      [lock.address, web3.utils.keccak256(code)]
    ))
        
    codeAccount = web3.eth.accounts.privateKeyToAccount(codePK)

    // Create the hook contract with that code
    hookContract = await CodeRequiredHook.new({
      from: lockCreator,
    })
    await hookContract.addCodes(lock.address, [codeAccount.address], {
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

  it('reverts if adding a zero code', async () => {
    await reverts(
      hookContract.addCodes(lock.address, [constants.ZERO_ADDRESS], {
      from: lockCreator,
    }),
      'INVALID_CODE'
    )
  })

  it('reverts if removing a zero code', async () => {
    await reverts(
      hookContract.removeCodes(lock.address, [constants.ZERO_ADDRESS], {
      from: lockCreator,
    }),
      'INVALID_CODE'
    )
  })

  it('can buy if you know the code', async () => {
    const messageToSign = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(['address'], [keyBuyer])
    )
    const signature = (await codeAccount.sign(messageToSign)).signature
    await lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, signature, {
      from: keyBuyer,
    })
  })

  it('can not buy with no code provided', async () => {
    await reverts(
      lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, [], {
        from: keyBuyer,
      }),
      'ECDSA: invalid signature length'
    )
  })

  it('can not buy with an incorrect code provided', async () => {
    // Calculate an incorrect code
    const code = 'WRONG'
    const codePK = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['address', 'bytes32'],
        // By including the lock address in the codePK, we can have
        // codes reused for multiple locks without that being visible on-chain
        [lock.address, web3.utils.keccak256(code)]
    ))
    const wrongcodeAccount = web3.eth.accounts.privateKeyToAccount(codePK)
    const messageToSign = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(['address'], [keyBuyer])
    )
    const signature = (await wrongcodeAccount.sign(messageToSign)).signature
    await reverts(
      lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, signature, {
        from: keyBuyer,
      }),
      'INCORRECT_CODE'
    )
  })

  describe('can remove codes', () => {
    beforeEach(async () => {
      await hookContract.removeCodes(lock.address, [codeAccount.address], {
        from: lockCreator,
      })
    })

    it('cannot buy even with the previous code', async () => {
      const messageToSign = web3.utils.keccak256(
        web3.eth.abi.encodeParameters(['address'], [keyBuyer])
      )
      const signature = (await codeAccount.sign(messageToSign)).signature
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

    it('can now buy without the code', async () => {
      await lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, [], {
        from: keyBuyer,
      })
    })
  })
})
