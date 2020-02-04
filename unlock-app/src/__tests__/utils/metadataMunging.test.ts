import { generateColumns } from '../../utils/metadataMunging'

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
})
