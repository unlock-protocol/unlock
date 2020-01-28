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
        let successfulDispatch = await Email.dispatch({
          keyId: '1',
          emailAddress: 'email@example.com',
          lockAddress: 'lock address',
          lockName: 'Test Lock Name'
        })

        expect(successfulDispatch).toBe(true)
      })
    })

    describe('when there is an issue with the email request', () => {
      it('returns false', async () => {
        expect.assertions(1)
        let unsuccessfulDispatch = await Email.dispatch({
          keyId: '2',
          emailAddress: 'email@example.com',
          lockAddress: 'lock address 2',
          lockName: 'Test Lock Name'
        })

        expect(unsuccessfulDispatch).toBe(false)
      })
    })
  })
})
