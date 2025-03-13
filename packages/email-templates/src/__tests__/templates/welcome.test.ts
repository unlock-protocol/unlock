// @vitest-environment jsdom

import { asHtml } from '../utils'
import welcome from '../../templates/welcome'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'

describe('welcome', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(prepareAll(welcome).subject()).toBe('Welcome to Unlock!')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    const html = asHtml(prepareAll(welcome).html({}))
    expect(html.textContent).toContain('The Unlock Team')
  })
})
