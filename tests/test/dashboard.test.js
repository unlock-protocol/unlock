const url = require('../helpers/url')

describe('The Unlock Dashboard', () => {
  beforeAll(async () => {
    await page.goto(url('/dashboard'))
  })

  const testLockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'

  it('should load the creator dashboard', async () => {
    await expect(page).toMatch('Creator Dashboard')
  })

  it('should list the address of the current user', async () => {
    await page.waitForSelector('#UserAddress')
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
})
