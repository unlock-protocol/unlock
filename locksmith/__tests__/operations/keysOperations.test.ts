import { buildKeysWithMetadata } from '../../src/operations/keysOperations'

const lock = {
  address: '0xxee',
  name: 'Alice in Borderlands',
  owner: '0x445',
  keys: [
    {
      owner: { address: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff' },
      keyId: '1',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: { address: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9' },
      keyId: '2',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: { address: '0x3fee1f4175001802d3828b76068b8d898e72a25a' },
      keyId: '3',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: { address: '0xff24307539a043e7fa40c4582090b3029de26b41' },
      keyId: '42',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    },
    {
      owner: { address: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5' },
      keyId: '43',
      expiration:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
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
          keyholderAddress: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '1',
        },
        {
          checkedInAt: 1660812066160,
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyholderAddress: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '2',
        },
        {
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyholderAddress: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '3',
        },
        {
          address: 'email address',
          email: 'kld.diagne@gmail.com',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          firstname: 'kalidou',
          keyholderAddress: '0xff24307539a043e7fa40c4582090b3029de26b41',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '42',
        },
        {
          address: 'brescia',
          email: 'example@gmai.com',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          firstname: 'mario rossi',
          keyholderAddress: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
          lockAddress: '0xxee',
          lockName: 'Alice in Borderlands',
          token: '43',
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
          keyholderAddress: '0x4ff5a116ff945cc744346cfd32c6c6e3d3a018ff',
          lockAddress: '0xxee',
        },
        {
          token: '2',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyholderAddress: '0xf44ff7951688bfbbb573967ffcb0d8aabdaf36c9',
          lockAddress: '0xxee',
        },
        {
          token: '3',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyholderAddress: '0x3fee1f4175001802d3828b76068b8d898e72a25a',
          lockAddress: '0xxee',
        },
        {
          token: '42',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyholderAddress: '0xff24307539a043e7fa40c4582090b3029de26b41',
          lockAddress: '0xxee',
        },
        {
          token: '43',
          lockName: 'Alice in Borderlands',
          expiration:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          keyholderAddress: '0x77ccc37a6d89a75a29cdaa74e757599efc4b30f5',
          lockAddress: '0xxee',
        },
      ])
    })

    it('should not return keys', () => {
      expect.assertions(2)
      const results = buildKeysWithMetadata(
        {
          address: '0xxee',
          name: 'Alice in Borderlands',
          owner: '0x445',
          keys: [],
        },
        []
      )

      expect(results.length).toBe(0)
      expect(results).toStrictEqual([])
    })
  })
})
