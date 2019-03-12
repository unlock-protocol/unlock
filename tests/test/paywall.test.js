const url = require('../helpers/url')

describe('paywall, running in new window', () => {

  const testLockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
  const newWindowTestLockAddress = '0x8276A24C03B7ff9307c5bb9c0f31aa60d284375f'

  function lockSelector(name, newWindow = false) {
    return `#${name}_${newWindow ? newWindowTestLockAddress : testLockAddress}`
  }

  describe('Paywall demo', () => {
    beforeAll(async () => {
      await Promise.all([
        page.goto(url(`/demo/${testLockAddress}`)),
        page.waitForNavigation(),
      ])
    })
    it('should display a lock on the demo page with a paywall', async () => {
      await page.waitForFunction(() => window.frames.length)
      const paywallIframe = page.mainFrame().childFrames()[0]
      await paywallIframe.waitForSelector(lockSelector('Lock'))
      await paywallIframe.waitForFunction((ethPriceSelector) => {
        const eth = document.querySelector(ethPriceSelector)
        if (!eth) return false
        return eth.innerText === '0.33 ETH'
      }, {}, lockSelector('EthPrice'))
    }, 15000)
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
      await page.waitFor(1000)
      await page.waitForFunction(() => window.frames.length)
      const paywallIframe = page.mainFrame().childFrames()[0]
      await paywallIframe.waitForFunction(() => {
        const unlockFlag = document.querySelector('#UnlockFlag')
        if (!unlockFlag) return false
        return true
      })
    }, 15000)
    it('should redirect to the content page if a key has been purchased', async () => {
      await Promise.all([
        page.goto(url(`/paywall/${testLockAddress}/${encodeURIComponent(url(`/demo/${testLockAddress}`))}`)),
        page.waitForNavigation(),
      ])
      await page.waitForFunction((expectedUrl) => {
        return window.location.href === expectedUrl
      }, url(`/demo/${testLockAddress}#0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2`))
    })
  })

  describe('opening in separate window instead of iframe', () => {
    beforeAll(async () => {
      await page.goto(url('/dashboard'))
      await expect(page).toClick('button', { text: 'Create Lock' })
      await expect(page).toClick('button', { text: 'Submit' })
      await page.waitFor(500)
      await expect(page).toMatch('30 days')
      await page.waitForSelector(lockSelector('LockEmbeddCode', true))
      await Promise.all([
        page.goto(url(`/paywall/${newWindowTestLockAddress}/${encodeURIComponent(url(`/demo/${newWindowTestLockAddress}`))}`)),
        page.waitForNavigation(),
      ])
    })
  
    it('key purchase displays the confirmations modal', () => {
  
    }, 15000)
    it('key purchase redirects on clicking the modal', () => {
  
    })
  })
})
