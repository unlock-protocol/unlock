const { main: url } = require('../helpers/url')

jest.setTimeout(30000)

describe('The Unlock Paywall', () => {
  const testLockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'

  function lockSelector(name) {
    return `#${name}_${testLockAddress}`
  }

  beforeAll(async () => {
    await Promise.all([
      page.goto(url(`/demo/${testLockAddress}`)),
      page.waitForNavigation(),
    ])
  }, 10000)

  it('should remove the blocker', async () => {
    await page.waitForFunction(() => !document.querySelector('#_unlock_blocker'))
  })

  it('should display the lock after the blocker is gone', async () => {
    await page.waitForFunction(() => window.frames.length)
    const paywallIframe = page.mainFrame().childFrames()[0]
    await paywallIframe.waitForSelector(lockSelector('Lock'))
    await paywallIframe.waitForFunction((ethPriceSelector) => {
      const eth = document.querySelector(ethPriceSelector)
      if (!eth) return false
      return eth.innerText === '0.33 ETH'
    }, {}, lockSelector('EthPrice'))
  })

  it('clicking the lock purchases a key', async () => {
    const paywallIframe = page.mainFrame().childFrames()[0]
    const paywallBody = await paywallIframe.$('body')
    await expect(paywallBody).toClick(lockSelector('PurchaseKey'))
    await paywallIframe.waitForFunction((footerSelector) => {
      const footer = document.querySelector(footerSelector)
      if (!footer) return false
      return footer.innerText === 'Payment Pending'
    }, {}, 'footer')
  })

  it('after key purchase, unlocked flag appears', async () => {
    await page.reload()
    await page.waitForFunction(() => window.frames.length)
    const paywallIframe = page.mainFrame().childFrames()[0]
    await paywallIframe.waitForFunction(() => {
      const unlockFlag = document.querySelector('#UnlockFlag')
      if (!unlockFlag) return false
      return true
    })
  })
})
