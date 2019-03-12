const url = require('../helpers/url')

describe('The Unlock Dashboard', () => {
  beforeAll(async () => {
    await page.goto(url('/dashboard'))
  })

  const testLockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'

  function lockSelector(name) {
    return `#${name}_${testLockAddress}`
  }

  it('should load the creator dashboard', async () => {
    await expect(page).toMatch('Creator Dashboard')
  })

  it('should list the address of the current user', async () => {
    const userAddress = await page.$eval('#UserAddress', e => e.innerText)
    await expect(userAddress).toMatch('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
  })

  it('should have a button allowing the creation of a Lock', async () => {
    const createLockButton = await page.waitFor('#CreateLockButton')
    await expect(createLockButton).toMatch('Create Lock')
  })

  describe('Lock creation', () => {
    it('should display the lock creation form', async () => {
      await expect(page).toClick('button', { text: 'Create Lock' })
      await expect(page).toMatch('Submit')
      await expect(page).toMatch('Cancel')
      await expect(page).toMatch('days')
    })

    it('should persist the lock', async () => {
      await expect(page).toFill('input[name="name"]', 'Updated Lock Name')
      await expect(page).toClick('button', { text: 'Submit' })
      await page.waitFor(500)
      await expect(page).toMatch('30 days')
    }, 8000)
  })

  describe('Lock Embedd Code', () => {
    it('should toggle the embed code', async () => {
      await page.waitForSelector(`#LockEmbeddCode_${testLockAddress}`)
      await expect(page).toClick(`#LockEmbeddCode_${testLockAddress}`)
      await expect(page).toMatch('Code snippet')
    }, 25000)

    it('has a Preview dashboard button', async () => {
      await page.waitForSelector(`#PreviewButton_${testLockAddress}`)
      await expect(page).toMatchElement(`#PreviewButton_${testLockAddress}`)
    }, 25000)
  })

  describe('Lock Editing', () => {
    it('a button exists to edit the Lock details', async () => {
      await expect(page).toMatchElement(`#EditLockButton_${testLockAddress}`)
    })

    describe('editting the Lock price', () => {
      it('allows the lock owner to update the price of the lock', async () => {
        await expect(page).toMatchElement(`#EditLockButton_${testLockAddress}`)
        await expect(page).toClick(`#EditLockButton_${testLockAddress}`)
        await expect(page).toMatchElement(`#KeyPriceEditField_${testLockAddress}`)
        await expect(page).toFill(`input[id="KeyPriceEditField_${testLockAddress}"]`, '0.33')
        await expect(page).toClick('button', { text: 'Submit' })
        await expect(page).toMatch('0.33')
      })
    })
  })

  describe('Data existing after refresh', () => {
    it('should retain the lock name', async () => {
      await page.reload()
      await page.waitFor(3500)
      await expect(page).toMatch('Updated Lock Name')
    })
  })

  // TODO: figure out why these will not pass in a separate file
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
  })
})
