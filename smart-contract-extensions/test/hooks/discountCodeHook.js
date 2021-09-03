const { constants, protocols } = require('hardlydifficult-eth')
const { reverts } = require('truffle-assertions')
const BigNumber = require('bignumber.js')

const DiscountCodeHook = artifacts.require('DiscountCodeHook.sol')

function getCodeAccount(lock, discountCode) {
  // Sanitize input for ease of use
  // We may want to handle spaces and underscores as well to ensure
  // it works as expected for most
  discountCode = discountCode.trim().toLowerCase()

  const codePK = web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ['address', 'bytes32'],
      // By including the lock address in the codePK, we can have
      // codes reused for multiple locks without that being visible on-chain
      [lock.address, web3.utils.keccak256(discountCode)]
    )
  )
  return web3.eth.accounts.privateKeyToAccount(codePK)
}

function getCodeAddress(lock, discountCode) {
  const codeAccount = getCodeAccount(lock, discountCode)
  return codeAccount.address
}

async function getDataField(lock, keyBuyer, discountCode) {
  const codeAccount = getCodeAccount(lock, discountCode)
  const messageToSign = web3.utils.keccak256(
    web3.eth.abi.encodeParameters(['address'], [keyBuyer])
  )
  return (await codeAccount.sign(messageToSign)).signature
}

contract('DiscountCodeHook', accounts => {
  const lockCreator = accounts[1]
  const keyBuyer = accounts[5]
  const keyPrice = new BigNumber(web3.utils.toWei('1', 'ether'))
  let lock
  let hookContract

  beforeEach(async () => {
    // Create a lock
    lock = await protocols.unlock.createTestLock(web3, {
      keyPrice: keyPrice.toFixed(),
      from: lockCreator,
    })

    // Create the hook contract, the sender is an admin by default
    hookContract = await DiscountCodeHook.new({
      from: lockCreator,
    })

    // Register the hook
    await lock.setEventHooks(hookContract.address, constants.ZERO_ADDRESS, {
      from: lockCreator,
    })

    // Add supported discount codes
    await hookContract.addCodes(
      lock.address,
      [getCodeAddress(lock, 'joerogan'), getCodeAddress(lock, 'unlock 25')],
      [5000, 2500],
      {
        from: lockCreator,
      }
    )
  })

  it('you can read the discount amount for a given lock and code', async () => {
    const discount = await hookContract.lockToCodeAddressToDiscountBasisPoints(
      lock.address,
      getCodeAddress(lock, 'joerogan')
    )
    assert.equal(discount, 5000)
  })

  it('you can buy without a code', async () => {
    await lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, [], {
      value: keyPrice.toFixed(),
      from: keyBuyer,
    })
  })

  it('there is no discount without a code', async () => {
    await reverts(
      lock.purchase('0', keyBuyer, constants.ZERO_ADDRESS, [], {
        value: keyPrice.minus(1).toFixed(),
        from: keyBuyer,
      }),
      'INSUFFICIENT_VALUE'
    )
  })

  it('you can buy even if an incorrect code is entered', async () => {
    await lock.purchase(
      '0',
      keyBuyer,
      constants.ZERO_ADDRESS,
      await getDataField(lock, keyBuyer, 'incorrect code'),
      {
        value: keyPrice.toFixed(),
        from: keyBuyer,
      }
    )
  })

  it('you cannot buy if an invalid code is entered', async () => {
    // Ideally the purchase here would be successful but try/catch only works with external calls
    // ECDSA is an internal library so the only way to make this work would be to copy and modify it for this use case
    await reverts(
      lock.purchase(
        '0',
        keyBuyer,
        constants.ZERO_ADDRESS,
        '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        {
          value: keyPrice.toFixed(),
          from: keyBuyer,
        }
      ),
      "ECDSA: invalid signature 'v' value"
    )
  })

  it('there is no discount if an invalid code is entered', async () => {
    await reverts(
      lock.purchase(
        '0',
        keyBuyer,
        constants.ZERO_ADDRESS,
        await getDataField(lock, keyBuyer, 'incorrect code'),
        {
          value: keyPrice.minus(1).toFixed(),
          from: keyBuyer,
        }
      ),
      'INSUFFICIENT_VALUE'
    )
  })

  it('you can buy at a discount with the code', async () => {
    await lock.purchase(
      '0',
      keyBuyer,
      constants.ZERO_ADDRESS,
      await getDataField(lock, keyBuyer, 'joerogan'),
      {
        // This code cuts the price in half
        value: keyPrice.div(2).toFixed(),
        from: keyBuyer,
      }
    )
  })

  it('the available discount is not more than expected', async () => {
    await reverts(
      lock.purchase(
        '0',
        keyBuyer,
        constants.ZERO_ADDRESS,
        await getDataField(lock, keyBuyer, 'joerogan'),
        {
          value: keyPrice
            .div(2)
            .minus(1)
            .toFixed(),
          from: keyBuyer,
        }
      ),
      'INSUFFICIENT_VALUE'
    )
  })

  it('you can still leave a tip when purchasing with a code', async () => {
    await lock.purchase(
      '0',
      keyBuyer,
      constants.ZERO_ADDRESS,
      await getDataField(lock, keyBuyer, 'joerogan'),
      {
        value: keyPrice
          .div(2)
          .plus(web3.utils.toWei('0.1', 'ether'))
          .toFixed(),
        from: keyBuyer,
      }
    )
  })

  it('different codes may offer different discounts', async () => {
    const purchasePrice = await lock.purchasePriceFor(
      keyBuyer,
      constants.ZERO_ADDRESS,
      await getDataField(lock, keyBuyer, 'unlock 25'),
      {
        from: keyBuyer,
      }
    )

    // This code reduces the price by 25%
    assert.equal(purchasePrice.toString(), keyPrice.times(0.75).toFixed())
  })

  it('non-lock managers cannot modify codes', async () => {
    await reverts(
      hookContract.addCodes(
        lock.address,
        [getCodeAddress(lock, 'fail')],
        [5000],
        {
          from: keyBuyer,
        }
      ),
      "VM Exception while processing transaction: reverted with reason string 'ONLY_LOCK_MANAGER'"
    )
  })

  it('fails if you attempt to modify an address(0) code', async () => {
    await reverts(
      hookContract.addCodes(
        lock.address,
        [constants.ZERO_ADDRESS],
        [5000],
        {
          from: lockCreator,
        }
      ),
      'INVALID_CODE'
    )
  })

  describe('codes can be removed', () => {
    beforeEach(async () => {
      await hookContract.addCodes(
        lock.address,
        [getCodeAddress(lock, 'joerogan')],
        [0],
        {
          from: lockCreator,
        }
      )
    })

    it('now the code no longer offers any discount', async () => {
      const purchasePrice = await lock.purchasePriceFor(
        keyBuyer,
        constants.ZERO_ADDRESS,
        await getDataField(lock, keyBuyer, 'joerogan'),
        {
          from: keyBuyer,
        }
      )

      assert.equal(purchasePrice.toString(), keyPrice.toFixed())
    })
  })

  describe('the hook contract may be removed', () => {
    beforeEach(async () => {
      await lock.setEventHooks(constants.ZERO_ADDRESS, constants.ZERO_ADDRESS, {
        from: lockCreator,
      })
    })

    it('now the code no longer offers any discount', async () => {
      const purchasePrice = await lock.purchasePriceFor(
        keyBuyer,
        constants.ZERO_ADDRESS,
        await getDataField(lock, keyBuyer, 'joerogan'),
        {
          from: keyBuyer,
        }
      )

      assert.equal(purchasePrice.toString(), keyPrice.toFixed())
    })
  })
})
