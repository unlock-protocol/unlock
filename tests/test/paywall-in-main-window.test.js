const { main, paywall } = require('../helpers/url')

jest.setTimeout(30000)

describe('Paywall in main window', () => {
  const testLockAddress = '0x8276A24C03B7ff9307c5bb9c0f31aa60d284375f'

  function lockSelector(name) {
    return `#${name}_${testLockAddress}`
  }

  beforeAll(async () => {
    // create a new lock using the creator dashboard
    // TODO: design a convenience function that will create a lock for us
    // to decouple this test from the creator dashboard
    await page.goto(main('/dashboard'))
    await page.waitForSelector('#UserAddress')
    await page.waitFor('#CreateLockButton')
    await expect(page).toClick('button', { text: 'Create Lock' })
    await expect(page).toClick('button', { text: 'Submit' })
    await page.waitFor(1000)
    // wait for mining. ganache mines every second

    await Promise.all([
      page.goto(paywall(`/${testLockAddress}/http%3A%2F%2Fexample.com`)),
      page.waitForNavigation(),
    ])
    await page.waitForSelector(lockSelector('Lock'))
    await page.waitForFunction((ethPriceSelector) => {
      const eth = document.querySelector(ethPriceSelector)
      if (!eth) return false
      return eth.innerText === '0.01 ETH'
    }, {}, lockSelector('EthPrice'))
  })

  it('purchasing a key works', async () => {
    await expect(page).toClick(lockSelector('PurchaseKey'))
    await page.waitForFunction((footerSelector) => {
      const footer = document.querySelector(footerSelector)
      if (!footer) return false
      return footer.innerText === 'Payment Pending'
    }, {}, 'footer')
  })

  it('dismissing the modal redirects to http://example.com', async () => {
    await page.waitForSelector(lockSelector('Confirmed'))
    await Promise.all([
      expect(page).toClick(lockSelector('Confirmed')),
      page.waitForNavigation(),
    ])
    await expect(page).toMatch('Example Domain')
  })

  it('returning to the main window redirects to content', async () => {
    await Promise.all([
      page.goto(paywall(`/${testLockAddress}/http%3A%2F%2Fexample.com`)),
      page.waitForNavigation(),
    ])
    await page.waitForNavigation()
    await expect(page).toMatch('Example Domain')
  })
})
