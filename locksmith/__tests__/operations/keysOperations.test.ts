import {
  buildKeysWithMetadata,
  getKeysWithMetadata,
} from '../../src/operations/keysOperations'
import { loginRandomUser } from '../test-helpers/utils'
import app from '../app'
import { vi, expect, describe, it } from 'vitest'
const network = 4
const lockAddress = '0x62CcB13A72E6F991dE53b9B7AC42885151588Cd2'
const wrongLockAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const lock = {
  address: '0xxee',
  name: 'Alice in Borderlands',
  owner: '0x445',
  keys: [
    {
      owner: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
      tokenId: '1',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      transactionsHash: ['0x'],
    },
    {
      manager: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
      owner: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
      tokenId: '2',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      transactionsHash: ['0x'],
    },
    {
      manager: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
      owner: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
      tokenId: '3',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      transactionsHash: ['0x'],
    },
    {
      manager: '0xff24307539a043e7fa40c4582090b3029de26b41',
      owner: '0xff24307539a043e7fa40c4582090b3029de26b41',
      tokenId: '42',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      transactionsHash: ['0x'],
    },
    {
      manager: '0x8D33b257bce083eE0c7504C7635D1840b3858AFD',
      owner: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
      tokenId: '43',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      transactionsHash: ['0x'],
    },
  ],
}

const metadataItems = [
  {
    userAddress: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
    data: { extraMetadata: { checkedInAt: 1660812048626 } },
  },
  {
    userAddress: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
    data: { extraMetadata: { checkedInAt: 1660812066160 } },
  },
  {
    userAddress: '0xff24307539a043e7fa40c4582090b3029de26b41',
    data: {
      userMetadata: {
        public: {},
        protected: {
          email: 'kld.diagne@gmail.com',
          address: 'email address',
          firstname: 'kalidou',
        },
      },
      extraMetadata: {},
    },
  },
  {
    userAddress: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
    data: {
      userMetadata: {
        public: {},
        protected: {
          email: 'example@gmai.com',
          address: 'brescia',
          firstname: 'mario rossi',
        },
      },
      extraMetadata: {},
    },
  },
]

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string) =>
          lockAddress.toLowerCase() === lock.toLowerCase(),
      }
    }),
  }
})

vi.mock('../../src/graphql/datasource/keysByQuery', () => {
  return {
    keysByQuery: async () => Promise.resolve([lock]),
  }
})

vi.mock('../../src/operations/metadataOperations', () => {
  return {
    getKeysMetadata: () => {
      return metadataItems
    },
  }
})
describe('keysOperations operations', () => {
  describe('buildKeysWithMetadata', () => {
    it('should merge keys items with the corresponding metadata', () => {
      expect.assertions(2)
      const results = buildKeysWithMetadata(lock, metadataItems)

      expect(results.length).toBe(5)
      expect(results).toEqual([
        {
          checkedInAt: 1660812048626,
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          keyholderAddress: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '1',
          transactionsHash: ['0x'],
        },
        {
          checkedInAt: 1660812066160,
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          keyholderAddress: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '2',
          transactionsHash: ['0x'],
        },
        {
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          keyholderAddress: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '3',
          transactionsHash: ['0x'],
        },
        {
          address: 'email address',
          email: 'kld.diagne@gmail.com',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          firstname: 'kalidou',
          keyManager: '0xff24307539a043e7fa40c4582090b3029de26b41',
          keyholderAddress: '0xff24307539a043e7fa40c4582090b3029de26b41',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '42',
          transactionsHash: ['0x'],
        },
        {
          address: 'brescia',
          email: 'example@gmai.com',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          firstname: 'mario rossi',
          keyManager: '0x8D33b257bce083eE0c7504C7635D1840b3858AFD',
          keyholderAddress: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '43',
          transactionsHash: ['0x'],
        },
      ])
    })

    it('should returns keys items without metadata', () => {
      expect.assertions(2)
      const results = buildKeysWithMetadata(lock, [])

      expect(results.length).toBe(5)
      expect(results).toStrictEqual([
        {
          token: '1',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          keyholderAddress: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '2',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          keyholderAddress: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '3',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          keyholderAddress: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '42',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0xff24307539a043e7fa40c4582090b3029de26b41',
          keyholderAddress: '0xff24307539a043e7fa40c4582090b3029de26b41',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '43',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x8D33b257bce083eE0c7504C7635D1840b3858AFD',
          keyholderAddress: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
      ])
    })

    it('should not return keys', () => {
      expect.assertions(2)
      const results = buildKeysWithMetadata(
        {
          address: '0xxee',
          name: 'Alice in Borderlands',
          keys: [],
        },
        []
      )

      expect(results.length).toBe(0)
      expect(results).toStrictEqual([])
    })
  })

  describe('getKeysWithMetadata', () => {
    it('should return keys with metadata for lockManager', async () => {
      expect.assertions(2)

      const { address } = await loginRandomUser(app)
      const items = await getKeysWithMetadata({
        network,
        lockAddress,
        filters: {},
        loggedInUserAddress: address,
      })
      expect(items.length).toBe(5)
      expect(items).toEqual([
        {
          token: '1',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          keyholderAddress: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          lockAddress: '0xxee',
          checkedInAt: 1660812048626,
          transactionsHash: ['0x'],
        },
        {
          token: '2',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          keyholderAddress: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          lockAddress: '0xxee',
          checkedInAt: 1660812066160,
          transactionsHash: ['0x'],
        },
        {
          token: '3',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          keyholderAddress: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '42',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0xff24307539a043e7fa40c4582090b3029de26b41',
          keyholderAddress: '0xff24307539a043e7fa40c4582090b3029de26b41',
          lockAddress: '0xxee',
          email: 'kld.diagne@gmail.com',
          address: 'email address',
          firstname: 'kalidou',
          transactionsHash: ['0x'],
        },
        {
          token: '43',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x8D33b257bce083eE0c7504C7635D1840b3858AFD',
          keyholderAddress: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
          lockAddress: '0xxee',
          email: 'example@gmai.com',
          address: 'brescia',
          firstname: 'mario rossi',
          transactionsHash: ['0x'],
        },
      ])
    })

    it('should return keys without metadata for non-lockManager', async () => {
      expect.assertions(2)

      const { address } = await loginRandomUser(app)
      const items = await getKeysWithMetadata({
        network,
        lockAddress: wrongLockAddress,
        filters: {},
        loggedInUserAddress: address,
      })
      expect(items.length).toBe(5)
      expect(items).toEqual([
        {
          token: '1',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          keyholderAddress: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '2',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          keyholderAddress: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '3',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          keyholderAddress: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '42',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0xff24307539a043e7fa40c4582090b3029de26b41',
          keyholderAddress: '0xff24307539a043e7fa40c4582090b3029de26b41',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
        {
          token: '43',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyManager: '0x8D33b257bce083eE0c7504C7635D1840b3858AFD',
          keyholderAddress: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
          lockAddress: '0xxee',
          transactionsHash: ['0x'],
        },
      ])
    })
  })
})
