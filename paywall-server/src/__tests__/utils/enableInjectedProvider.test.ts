import {
  getProvider,
  enableInjectedProvider,
} from '../../utils/enableInjectedProvider'

describe('enableInjectedProvider utils', () => {
  describe('getProvider', () => {
    it('returns undefined if there is no provider', () => {
      expect.assertions(1)

      expect(getProvider({})).toBeUndefined()
    })

    it('returns window.ethereum if it is set', () => {
      expect.assertions(1)

      const window = {
        ethereum: {
          enable: jest.fn(),
        },
      }

      expect(getProvider(window)).toEqual(window.ethereum)
    })

    it('returns window.web3.currentProvider if it is set', () => {
      expect.assertions(1)

      const window = {
        web3: {
          currentProvider: {
            enable: jest.fn(),
          },
        },
      }

      expect(getProvider(window)).toEqual(window.web3.currentProvider)
    })
  })

  describe('enableInjectedProvider', () => {
    it('rejects when there is no provider', () => {
      expect.assertions(1)

      expect(enableInjectedProvider(undefined)).rejects.toEqual(
        new Error('Fatal: no web3 provider found.')
      )
    })

    it('rejects when enable fails', () => {
      expect.assertions(1)

      const provider = {
        enable: jest
          .fn()
          .mockRejectedValue(new Error('User did not allow wallet to connect')),
      }

      expect(enableInjectedProvider(provider)).rejects.toEqual(
        new Error('User did not allow wallet to connect')
      )
    })

    it('resolves when enable succeeds', () => {
      expect.assertions(1)

      const provider = {
        enable: jest.fn().mockResolvedValue(undefined),
      }

      expect(enableInjectedProvider(provider)).resolves.toBeUndefined()
    })
  })
})
