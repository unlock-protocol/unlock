import { makeDefaultKeys } from '../../../../data-iframe/blockchainHandler/BlockchainHandler'

describe('BlockchainHandler - makeDefaultKeys', () => {
  it.each([null, '0x1234567890123456789012345678901234567890'])(
    'should set up default keys for %s account',
    (account: string | null) => {
      expect.assertions(1)

      const addresses = [
        '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        '0x15B87bdC4B3ecb783F56f735653332EAD3BCa5F8',
        '0xBF7F1bdB3a2D6c318603FFc8f39974e597b6af5e',
      ]
      const lowerAddresses = addresses.map(address => address.toLowerCase())
      const expectedKeys = {
        [lowerAddresses[0].toLowerCase()]: {
          lock: lowerAddresses[0],
          owner: account,
          expiration: 0,
        },
        [lowerAddresses[1].toLowerCase()]: {
          lock: lowerAddresses[1],
          owner: account,
          expiration: 0,
        },
        [lowerAddresses[2].toLowerCase()]: {
          lock: lowerAddresses[2],
          owner: account,
          expiration: 0,
        },
      }

      expect(makeDefaultKeys(lowerAddresses, account)).toEqual(expectedKeys)
    }
  )
})
