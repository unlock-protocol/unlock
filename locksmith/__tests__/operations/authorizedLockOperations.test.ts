import AuthorizedLockOperations from '../../src/operations/authorizedLockOperations'

const models = require('../../src/models')

const { AuthorizedLock } = models

describe('hasAuthorization', () => {
  const authorizedLock = '0xDc0731517234d0A13a4Da4572b9caC56d0cF5c29'
  const unauthorizedLock = '0xAc442c26177a33B255E811Ea2736234bCB4bCf96'
  AuthorizedLock.count = jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(1)

  describe('when the provided address has not been authorized', () => {
    it('returns false', async () => {
      expect.assertions(1)
      const result = await AuthorizedLockOperations.hasAuthorization(
        authorizedLock
      )
      expect(result).toBe(false)
    })
  })

  describe('when the provided address has been authorized', () => {
    it('returns true', async () => {
      expect.assertions(1)
      const result = await AuthorizedLockOperations.hasAuthorization(
        unauthorizedLock
      )
      expect(result).toBe(true)
    })
  })
})
