const { ethers } = require('hardhat')
const { assert } = require('chai')
let mock

describe('unlockUtils', () => {
  let sender
  before(async () => {
    const MockArtifact = await ethers.getContractFactory('UnlockUtilsMock')
    mock = await MockArtifact.deploy()
    await mock.deployed()
    ;[sender] = await ethers.getSigners()
  })

  describe('function uint2str', () => {
    let str1
    let str2
    it('should convert a uint to a string', async () => {
      str1 = await mock.uint2Str(0)
      assert.equal(str1, '0')
      str2 = await mock.uint2Str(42)
      assert.equal(str2, '42')
    })
  })

  describe('function strConcat', () => {
    let resultingStr

    it('should concatenate 4 strings', async () => {
      resultingStr = await mock.strConcat('hello', '-unlock', '/', '42')
      assert.equal(resultingStr, 'hello-unlock/42')
    })
  })

  describe('function address2Str', () => {
    // currently returns the address as a string with all chars in lowercase
    it('should convert an ethereum address to an ASCII string', async () => {
      const senderAddress = await mock.address2Str(sender.address)
      assert.equal(ethers.utils.getAddress(senderAddress), sender.address)
    })
  })
})
