import * as Normalizer from '../../src/utils/normalizer'

describe('Normalizer', () => {
  describe('emailAddress', () => {
    it('returns a normalized email address', () => {
      expect.assertions(1)
      expect(Normalizer.emailAddress('TEST@EXAMPLE.COM')).toEqual(
        'test@example.com'
      )
    })
  })

  describe('ethereumAddress', () => {
    it('returns a normalized ethereum address', () => {
      expect.assertions(1)
      expect(
        Normalizer.ethereumAddress('0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2')
      ).toEqual('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
    })
  })

  describe('toLowerCaseKeys', () => {
    it('returns object with lowercase keys', () => {
      expect.assertions(1)
      expect(
        Normalizer.toLowerCaseKeys({
          Email: 'test',
        })
      ).toEqual({
        email: 'test',
      })
    })
  })
})
