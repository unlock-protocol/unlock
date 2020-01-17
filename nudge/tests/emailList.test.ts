import { extractEmails } from '../src/emailList'

jest.mock('../src/metadataOperations', () => {
  return {
    generateKeyMetadata: jest
      .fn()
      .mockResolvedValueOnce({
        userMetadata: {
          protected: {
            emailAddress: 'email@example.com',
          },
        },
      })
      .mockResolvedValueOnce({
        userMetadata: {},
      })
      .mockRejectedValueOnce({}),
  }
})

describe('extractEmails', () => {
  describe('when passing an empty collection', () => {
    it('returns an empty collection', async () => {
      expect.assertions(1)
      expect(await extractEmails([])).toEqual([])
    })
  })

  describe('when a non-empty collection with available email data', () => {
    it('return a collection of items and associated email addresses', async () => {
      expect.assertions(1)
      expect(
        await extractEmails([
          {
            lockAddress: 'valid lock address',
            keyId: '1',
          },
        ])
      ).toEqual([
        {
          lockAddress: 'valid lock address',
          keyId: '1',
          emailAddress: 'email@example.com',
        },
      ])
    })
  })

  describe('when a non-empty collection without available email data', () => {
    it('return a collection of items without associated email addresses', async () => {
      expect.assertions(1)
      expect(
        await extractEmails([
          {
            lockAddress: 'valid lock address',
            keyId: '2',
          },
        ])
      ).toEqual([
        {
          lockAddress: 'valid lock address',
          keyId: '2',
          emailAddress: undefined,
        },
      ])
    })
  })

  describe('when something fails attempting to generate metadata', () => {
    it('return a collection of items without associated email addresses', async () => {
      expect.assertions(1)
      expect(
        await extractEmails([
          {
            lockAddress: 'valid lock address',
            keyId: '3',
          },
        ])
      ).toEqual([
        {
          lockAddress: 'valid lock address',
          keyId: '3',
          emailAddress: undefined,
        },
      ])
    })
  })
})
