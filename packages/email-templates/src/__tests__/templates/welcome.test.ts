// @vitest-environment jsdom

import { asHtml } from '../utils'
import welcome from '../../templates/welcome'
import { expect, it, describe } from 'vitest'

describe('welcome', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(welcome.subject()).toBe('Welcome to Unlock!')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    const html = asHtml(welcome.html({}))
    expect(html.textContent).toContain(
      'Welcome aboard, and we look forward to serving you!'
    )
  })
})
