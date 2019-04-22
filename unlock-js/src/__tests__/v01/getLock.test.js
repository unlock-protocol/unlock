import Web3Utils from 'web3-utils'
import Web3Service from '../../web3Service'
import getLock from '../../v01/getLock'
import NockHelper from '../helpers/nockHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'

describe('v01', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })
    web3Service.getLock = getLock.bind(web3Service)
  })

  describe('getLock', () => {
    it('should trigger an event when it has been loaded woth an updated balance', done => {
      expect.assertions(2)

      nock.ethCallAndYield(
        '0x10e56973',
        lockAddress,
        '0x000000000000000000000000000000000000000000000000002386f26fc10000'
      )
      nock.ethCallAndYield(
        '0x11a4c03a',
        lockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000278d00'
      )
      nock.ethCallAndYield(
        '0x74b6c106',
        lockAddress,
        '0x000000000000000000000000000000000000000000000000000000000000000a'
      )
      nock.ethCallAndYield(
        '0x8da5cb5b',
        lockAddress,
        '0x00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1'
      )
      nock.ethCallAndYield(
        '0x18160ddd',
        lockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000000011'
      )
      nock.getBalanceForAccountAndYieldBalance(lockAddress, '0xdeadfeed')
      nock.ethBlockNumber(`0x${(1337).toString('16')}`)

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toMatchObject({
          balance: Web3Utils.fromWei('3735944941', 'ether'),
          keyPrice: Web3Utils.fromWei('10000000000000000', 'ether'),
          expirationDuration: 2592000,
          maxNumberOfKeys: 10,
          owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          outstandingKeys: 17,
          asOf: 1337,
        })
        done()
      })

      return web3Service.getLock(lockAddress)
    })

    it('should successfully yield a lock with an unlimited number of keys', done => {
      expect.assertions(2)
      nock.ethCallAndYield(
        '0x10e56973',
        lockAddress,
        '0x000000000000000000000000000000000000000000000000002386f26fc10000'
      )
      nock.ethCallAndYield(
        '0x11a4c03a',
        lockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000278d00'
      )
      nock.ethCallAndYield(
        '0x74b6c106',
        lockAddress,
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )
      nock.ethCallAndYield(
        '0x8da5cb5b',
        lockAddress,
        '0x00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1'
      )
      nock.ethCallAndYield(
        '0x18160ddd',
        lockAddress,
        '0x0000000000000000000000000000000000000000000000000000000000000011'
      )
      nock.getBalanceForAccountAndYieldBalance(lockAddress, '0xdeadfeed')
      nock.ethBlockNumber(`0x${(1337).toString('16')}`)

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toMatchObject({
          maxNumberOfKeys: -1,
        })
        done()
      })

      return web3Service.getLock(lockAddress)
    })
  })
})
