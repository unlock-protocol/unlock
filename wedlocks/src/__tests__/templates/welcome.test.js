// @vitest-environment jsdom

import { asHtml } from '../utils'
import welcome from '../../templates/welcome'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'

describe('welcome', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(prepareAll(welcome).subject()).toBe(
      'Welcome to Unlock! Please, read this email carefully'
    )
  })

  it('should have the right text', () => {
    expect.assertions(2)
    const html = asHtml(
      prepareAll(welcome).html({
        recoveryLink: 'https://app.unlock-protocol.com/recover?SECRET',
      })
    )
    expect(html.textContent).toContain(
      'It is important that you never lose this link, as you cannot reset your password without this recovery link.'
    )
    expect(html.textContent).toContain(
      `https://app.unlock-protocol.com/recover?SECRET`
    )
  })
})
