import { getInjectedProvider, enableProvider } from '../../utils/provider'

describe('enableProvider utils', () => {
  describe('getInjectedProvider', () => {
    it('returns undefined if there is no provider', () => {
      expect.assertions(1)

      expect(getInjectedProvider({})).toBeUndefined()
    })

    it('returns window.ethereum if it is set', () => {
      expect.assertions(1)

      const window = {
        ethereum: {
          enable: vi.fn(),
        },
      }

      expect(getInjectedProvider(window)).toEqual(window.ethereum)
    })

    it('returns window.web3.currentProvider if it is set', () => {
      expect.assertions(1)

      const window = {
        web3: {
          currentProvider: {
            enable: vi.fn(),
          },
        },
      }

      expect(getInjectedProvider(window)).toEqual(window.web3.currentProvider)
    })
  })

  describe('enableProvider', () => {
    it('rejects when there is no provider', () => {
      expect.assertions(1)

      expect(enableProvider(undefined)).rejects.toEqual(
        new Error('Fatal: no web3 provider found.')
      )
    })

    it('rejects when enable fails', () => {
      expect.assertions(1)

      const provider = {
        enable: vi
          .fn()
          .mockRejectedValue(new Error('User did not allow wallet to connect')),
      }

      expect(enableProvider(provider)).rejects.toEqual(
        new Error('User did not allow wallet to connect')
      )
    })

    it('resolves when enable succeeds', () => {
      expect.assertions(1)

      const provider = {
        enable: vi.fn().mockResolvedValue(undefined),
      }

      expect(enableProvider(provider)).resolves.toBeUndefined()
    })
  })
})
