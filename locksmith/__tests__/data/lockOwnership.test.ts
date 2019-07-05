import LockOwnership from '../../src/data/lockOwnership'

const Lock = require('../../src/models').Lock

let mockWeb3Service: { getLock: any }

mockWeb3Service = {
  getLock: jest.fn().mockResolvedValueOnce({
    asOf: 227,
    balance: '0.01',
    expirationDuration: 2592000,
    keyPrice: '0.01',
    maxNumberOfKeys: 10,
    outstandingKeys: 1,
    name: 'a mighty fine lock',
    address: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
    owner: '0xb43333',
  }),
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function() {
    return mockWeb3Service
  },
}))

describe('Lock Ownership', () => {
  let host = 'http://localhost:8545'
  const ownedLocks = [
    {
      name: 'a mighty fine lock',
      address: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
      owner: '0x423893453',
    },
    {
      name: 'A random other lock',
      address: '0x8276A24C03B7ff9307c5bb9c0f31aa60d284375f',
      owner: '0x423893453',
    },
  ]

  beforeAll(async () => {
    await Lock.bulkCreate(ownedLocks)
  })

  afterAll(async () => {
    await Lock.truncate()
  })

  describe('when the locks are found', () => {
    it('persists the current state of ownership for the requested Locks', async () => {
      expect.assertions(1)
      await LockOwnership.update(host, [
        '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
      ])

      let lock = await Lock.findOne({
        where: { address: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267' },
      })
      expect(lock.owner.toLowerCase()).toEqual('0xb43333')
    })
  })
})
