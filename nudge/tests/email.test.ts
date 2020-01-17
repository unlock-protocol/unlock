import { Email } from '../src/email'

jest.mock('request-promise-native', () => {
  return jest
    .fn()
    .mockReturnValueOnce({ statusCode: 204 })
    .mockReturnValueOnce({ statusCode: 500 })
})

describe('Email', () => {
  describe('dispatch', () => {
    describe('when the email request was accepted', () => {
      it('returns true', async () => {
        expect.assertions(1)
        let successfulDispath = await Email.dispatch({
          keyId: '1',
          emailAddress: 'email@example.com',
          lockAddress: 'lock address',
        })

        expect(successfulDispath).toBe(true)
      })
    })

    describe('when there is an issue with the email request', () => {
      it('returns false', async () => {
        expect.assertions(1)
        let unsuccessfulDispath = await Email.dispatch({
          keyId: '2',
          emailAddress: 'email@example.com',
          lockAddress: 'lock address 2',
        })

        expect(unsuccessfulDispath).toBe(false)
      })
    })
  })
})
