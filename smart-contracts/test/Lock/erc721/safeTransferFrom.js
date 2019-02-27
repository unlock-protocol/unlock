const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const Web3Abi = require('web3-eth-abi')
const abi = new Web3Abi.AbiCoder()

const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock ERC721', accounts => {
  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
  })
  // function safeTransferFrom() still uses transferFrom() under the hood, but adds an additional check afterwards. transferFrom is already well-tested, so here we add a few checks to test only the new functionality.
  describe('safeTransferFrom', () => {
    const from = accounts[1]
    const to = accounts[2]
    let ID

    before(async () => {
      // first, let's purchase a brand new key that we can transfer
      await locks['FIRST'].purchaseFor(from, Web3Utils.toHex('Julien'), {
        value: Units.convert('0.01', 'eth', 'wei'),
        from
      })
      ID = await locks['FIRST'].getTokenIdFor.call(from)
    })

    it('should work if no data is passed in', async () => {
      await locks['FIRST'].safeTransferFrom(from, to, ID, {
        from
      })
      let ownerOf = await locks['FIRST'].ownerOf.call(ID)
      let data = await locks['FIRST'].keyDataFor.call(to)
      assert.equal(ownerOf, to)
      assert.equal(Web3Utils.toUtf8(data), 'Julien')
    })

    it('should work if some data is passed in ', async () => {
      await locks['FIRST'].purchaseFor(accounts[7], Web3Utils.toHex('Julien'), {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: accounts[7]
      })
      ID = await locks['FIRST'].getTokenIdFor.call(accounts[7])
      let sender = Web3Utils.toChecksumAddress(accounts[7])
      let receiver = Web3Utils.toChecksumAddress(accounts[6])
      // Using encodeFunctionCall as a workaround until the upgrade to Truffle v5.x. Can't call overloaded functions from js currently...
      let encodedCall = abi.encodeFunctionCall(
        {
          name: 'safeTransferFrom',
          type: 'function',
          inputs: [
            {
              type: 'address',
              name: '_from'
            },
            {
              type: 'address',
              name: '_to'
            },
            {
              type: 'uint256',
              name: '_tokenId'
            },
            {
              type: 'bytes',
              name: 'data'
            }
          ]
        },
        [sender, receiver, Web3Utils.toHex(ID), Web3Utils.toHex('Julien')]
      )

      await locks['FIRST'].sendTransaction({
        from: accounts[7],
        data: encodedCall
      })
      let ownerOf = await locks['FIRST'].ownerOf.call(ID)
      assert.equal(ownerOf, accounts[6])
      let data = await locks['FIRST'].keyDataFor.call(accounts[6])
      assert.equal(Web3Utils.toUtf8(data), 'Julien')
    })

    it('should fail if trying to transfer a key to a contract which does not implement onERC721Received', async () => {
      await locks['FIRST'].purchaseFor(
        accounts[5],
        Web3Utils.toHex('Someone Else'),
        {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accounts[5]
        }
      )
      ID = await locks['FIRST'].getTokenIdFor.call(accounts[5])
      // A contract which does NOT implement onERC721Received:
      let nonCompliantContract = unlock.address
      await shouldFail(
        locks['FIRST'].safeTransferFrom(accounts[5], nonCompliantContract, ID, {
          from: accounts[5]
        }),
        'NO_FALLBACK'
      )
      // make sure the key was not transferred
      let ownerOf = await locks['FIRST'].ownerOf.call(ID)
      assert.equal(ownerOf, accounts[5])
    })
  })
})
