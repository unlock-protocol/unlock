import LockOwnership from '../../src/data/lockOwnership'

const { Lock } = require('../../src/models')

const mockWeb3Service: { getLock: any } = {
  getLock: jest.fn().mockResolvedValueOnce({
    asOf: 227,
    balance: '0.01',
    expirationDuration: 2592000,
    keyPrice: '0.01',
    maxNumberOfKeys: 10,
    outstandingKeys: 1,
    name: 'a mighty fine lock',
    address: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
    owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  }),
}

const chain = 31337

function getMockWeb3Service() {
  return mockWeb3Service
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: getMockWeb3Service,
}))

describe('Lock Ownership', () => {
  const ownedLocks = [
    {
      chain,
      name: 'a mighty fine lock',
      address: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
      owner: '0x423893453',
    },
    {
      chain,
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
      await LockOwnership.update(
        ['0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'],
        chain
      )

      const lock = await Lock.findOne({
        where: {
          address: '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267',
        },
      })

      expect(lock.owner.toLowerCase()).toEqual(
        '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
      )
    })
  })
})
