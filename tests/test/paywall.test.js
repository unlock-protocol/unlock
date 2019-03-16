const url = require('../helpers/url')

describe('The Unlock Paywall', () => {
  const testLockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'

  function lockSelector(name) {
    return `#${name}_${testLockAddress}`
  }

  beforeAll(async () => {
    await page.goto(url('/dashboard'))
    await expect(page).toMatch('Creator Dashboard')
    await page.waitFor('#CreateLockButton')
    await page.waitForSelector(`#LockEmbeddCode_${testLockAddress}`)
    await expect(page).toMatch('30 days')
    await Promise.all([
      page.goto(url(`/demo/${testLockAddress}`)),
      page.waitForNavigation(),
    ])
    await page.waitForFunction(() => window.frames.length)
  })

  it('should load the creator dashboard', async () => {
    const paywallIframe = page.mainFrame().childFrames()[0]
    await paywallIframe.waitForSelector(lockSelector('Lock'))
    await paywallIframe.waitForFunction((ethPriceSelector) => {
      const eth = document.querySelector(ethPriceSelector)
      if (!eth) return false
      return eth.innerText === '0.33 ETH'
    }, {}, lockSelector('EthPrice'))
  }, 20000)
  it('clicking the lock purchases a key', async () => {
    const paywallIframe = page.mainFrame().childFrames()[0]
    const paywallBody = await paywallIframe.$('body')
    await expect(paywallBody).toClick(lockSelector('PurchaseKey'))
    await paywallIframe.waitForFunction((footerSelector) => {
      const footer = document.querySelector(footerSelector)
      if (!footer) return false
      return footer.innerText === 'Payment Pending'
    }, {}, 'footer')
  }, 15000)
  it('after key purchase, unlocked flag appears', async () => {
    await page.reload()
    await page.waitForFunction(() => window.frames.length)
    const paywallIframe = page.mainFrame().childFrames()[0]
    await paywallIframe.waitForFunction(() => {
      const unlockFlag = document.querySelector('#UnlockFlag')
      if (!unlockFlag) return false
      return true
    })
  }, 15000)
})
