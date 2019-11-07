import {
  generateColumns,
  mergeSingleDatum,
  mergeKeyholderMetadata,
} from '../../utils/metadataMunging'

const baseKeyMetadata = {
  lockName: 'a lock',
  expiration: '12345678',
  keyholderAddress: '0x123abc',
}

describe('metadata munging functions', () => {
  describe('generateColumns', () => {
    it('returns the starting columns when given empty input', () => {
      expect.assertions(2)

      let columns = generateColumns([])
      expect(columns).toEqual(['lockName', 'keyholderAddress', 'expiration'])

      columns = generateColumns([], ['favoriteColor'])
      expect(columns).toEqual(['favoriteColor'])
    })

    it('places the starting columns first and then alphabetizes additional columns', () => {
      expect.assertions(1)
      const keyMetadata = {
        ...baseKeyMetadata,
        zebras: 'true',
        platypus: 'weird',
        apples: 'oranges',
        beagles: 'doggo',
      }

      const columns = generateColumns([keyMetadata])
      expect(columns).toEqual([
        'lockName',
        'keyholderAddress',
        'expiration',
        // Alphabetizing starts here, after the starting columns
        'apples',
        'beagles',
        'platypus',
        'zebras',
      ])
    })

    it('pulls columns from multiple pieces of data', () => {
      expect.assertions(1)
      const firstKey = {
        ...baseKeyMetadata,
        email: 'in@ter.net',
      }
      const secondKey = {
        ...baseKeyMetadata,
        xylophone: 'a value',
      }

      const columns = generateColumns([firstKey, secondKey])
      expect(columns).toEqual([
        'lockName',
        'keyholderAddress',
        'expiration',
        'email',
        'xylophone',
      ])
    })
  })

  describe('mergeSingleDatum', () => {
    it('merges a base metadatum with additional fields from stored metadata', () => {
      expect.assertions(1)
      const lock = {
        address: '0x123',
        name: 'Lock',
      }
      const key = {
        keyId: '1',
        expiration: '123456',
        owner: {
          address: '0x123',
        },
      }
      const storedMetadata = {
        [lock.address]: {
          [key.keyId]: {
            protected: {
              zebra: 'true',
            },
            public: {
              elephant: 'trunk',
            },
          },
        },
      }
      const metadatum = mergeSingleDatum(lock, key, storedMetadata)
      expect(metadatum).toEqual({
        lockName: 'Lock',
        expiration: 'Expired',
        keyholderAddress: '0x123',
        elephant: 'trunk',
        zebra: 'true',
      })
    })
  })

  describe('mergeKeyholderMetadata', () => {
    it('returns empty array when there are no locks', () => {
      expect.assertions(1)
      expect(
        mergeKeyholderMetadata(
          {
            locks: [],
          },
          {}
        )
      ).toEqual([])
    })

    it('adds metadata for each key in a lock', () => {
      expect.assertions(1)
      const data = {
        locks: [
          {
            address: '0x123',
            name: 'Lock',
            keys: [
              {
                keyId: '1',
                expiration: '123456',
                owner: {
                  address: '0x126',
                },
              },
            ],
          },
          {
            address: '0x124',
            name: 'Dock',
            keys: [
              {
                keyId: '1',
                expiration: '123556',
                owner: {
                  address: '0x127',
                },
              },
            ],
          },
        ],
      }

      expect(mergeKeyholderMetadata(data, {})).toEqual([
        {
          expiration: 'Expired',
          keyholderAddress: '0x126',
          lockName: 'Lock',
        },
        {
          expiration: 'Expired',
          keyholderAddress: '0x127',
          lockName: 'Dock',
        },
      ])
    })
  })
})
