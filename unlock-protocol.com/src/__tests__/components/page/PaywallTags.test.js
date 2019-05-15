import React from 'react'
import * as rtl from 'react-testing-library'
import PaywallTags from '../../../components/page/PaywallTags'

const lock = '0x123'

describe('PaywallTags', () => {
  it('should render paywall tags if a lock is supplied', () => {
    expect.assertions(2)

    const tags = rtl.render(<PaywallTags lock={lock} />)

    expect(
      tags.container.querySelector(`meta[content="${lock}"`)
    ).not.toBeNull()
    expect(
      tags.container.querySelector(
        'script[src="https://paywall.unlock-protocol.com/static/paywall.min.js"]'
      )
    ).not.toBeNull()
  })

  it('should render paywall tags if a lock is not supplied', () => {
    expect.assertions(1)

    const tags = rtl.render(<PaywallTags lock={null} />)

    expect(tags.container.querySelector(`meta[content="${lock}"`)).toBeNull()
  })
})
