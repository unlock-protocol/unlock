const url = require('../helpers/url')

const {
  unlockHost,
  unlockPort,
  paywallHost,
  paywallPort,
} = require('../helpers/vars')

describe('url test helper, default values', () => {
  it('main', () => {
    expect.assertions(2)
    expect(url.main()).toBe(`http://${unlockHost}:${unlockPort}/`)
    expect(url.main('/path')).toBe(`http://${unlockHost}:${unlockPort}/path`)
  })

  it('paywall', () => {
    expect.assertions(2)
    expect(url.paywall()).toBe(`http://${paywallHost}:${paywallPort}/`)
    expect(url.paywall('/path')).toBe(
      `http://${paywallHost}:${paywallPort}/path`
    )
  })
})
