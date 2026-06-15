import { resolveRecipientEmail } from '../../../src/worker/tasks/sendToAll'

describe('sendToAll', () => {
  describe('resolveRecipientEmail', () => {
    it('trims and lowercases the email so whitespace addresses are not dropped', () => {
      expect(
        resolveRecipientEmail({ email: '  Igor@Gateway.fm  ' })
      ).toEqual('igor@gateway.fm')
    })

    it('reads alternative email keys regardless of case', () => {
      expect(resolveRecipientEmail({ EmailAddress: 'a@b.com' })).toEqual(
        'a@b.com'
      )
      expect(resolveRecipientEmail({ email_address: 'c@d.com' })).toEqual(
        'c@d.com'
      )
    })

    it('returns undefined when there is no email', () => {
      expect(resolveRecipientEmail({ name: 'no email here' })).toBeUndefined()
      expect(resolveRecipientEmail(undefined)).toBeUndefined()
    })
  })
})
