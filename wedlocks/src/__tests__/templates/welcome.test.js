/**
 * @jest-environment jsdom
 */
import { asHtml } from '../utils'
import welcome from '../../templates/welcome'

describe('welcome', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(welcome.subject()).toBe(
      'Welcome to Unlock! Please, read this email carefuly'
    )
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      asHtml(
        welcome.html({
          recoveryLink: 'https://app.unlock-protocol.com/recover?SECRET',
        })
      )
    ).toHaveTextContent(
      `Welcome to Unlock! We're excited to have you with us! Unlock is designed to make sure we can never access your data: it's encrypted with your password. Because of that, we can't reset your password like other services that you're used to. We know that sometimes things happen, and you may find that you need to reset your password in the future. To do that, you will need click on this link. (we're also adding a text version of the link that you can copy paste at the bottom of this email. Please, make sure to keep this link secret: do not forward this email to anyone. If someone accesses this email, they will be able to take over your Unlock account and all associated memberships. It is important that you never lose this link, as you cannot reset your password without this recovery link. https://app.unlock-protocol.com/recover?SECRET`
    )
  })
})
