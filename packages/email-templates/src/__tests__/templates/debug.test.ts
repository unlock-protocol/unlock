// @vitest-environment jsdom

import { asHtml } from '../utils'
import debug from '../../templates/debug'
import { expect, it, describe } from 'vitest'

describe('debug', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(debug.subject()).toBe('Debug Email')
  })

  it('should have the right text', () => {
    expect.assertions(2)
    const html = asHtml(
      debug.html({
        foo: 'bar',
      })
    )
    expect(html.textContent).toContain(' Welcome to Unlock!')
    expect(html.textContent).toContain('bar')
  })
})
