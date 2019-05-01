const deployLocks = require('../helpers/deployLocks')
// const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, lock

contract('Lock / erc721 / unlockUtils', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
  })

  describe('function uint2str', () => {
    let str1, str2
    it('should convert a uint to a string', async () => {
      str1 = await lock.uint2Str.call(0)
      assert.equal(str1, '0')
      str2 = await lock.uint2Str.call(42)
      assert.equal(str2, '42')
    })
  })

  describe('function strConcat', () => {
    let resultingStr1, resultingStr2, resultingStr3, moreThan2Str
    it('should concatenate 2 strings', async () => {
      resultingStr1 = await lock.strConcat.call('hello', ' unlock')
      resultingStr2 = await lock.strConcat.call('4', '2')
      resultingStr3 = await lock.strConcat.call(
        'https://locksmith.unlock-protocol.com/api/key/',
        '11'
      )
      assert.equal(resultingStr1, 'hello unlock')
      assert.equal(resultingStr2, '42')
      assert.equal(
        resultingStr3,
        'https://locksmith.unlock-protocol.com/api/key/11'
      )
    })

    it('should concatenate more than 2 strings', async () => {
      moreThan2Str = await lock.strConcat.call(
        await lock.strConcat.call('1', '2'),
        '3'
      )
      assert.equal(moreThan2Str, '123')
    })
  })

  describe('function address2Str', () => {
    let senderAddress
    // currently returns the address as a string with all chars in lowercase
    it('should convert an ethereum address to an ASCII string', async () => {
      senderAddress = await lock.address2Str.call(accounts[0])
      assert.equal(senderAddress, '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2')
    })
  })
})
