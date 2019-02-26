const url = require('../helpers/url')

describe('The Unlock Dashboard', () => {
  beforeAll(async () => {
    await page.goto(url('/dashboard'))
  })

  const testLockAddress = '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a';

  it('should load the creator dashboard', async () => {
    await expect(page).toMatch('Creator Dashboard')
  })

  it('should list the address of the current user', async () => {
    const userAddress = await page.$eval('#UserAddress', e => e.innerText)
    await expect(userAddress).toMatch(
      '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
    )
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
      await expect(page).toClick('button', { text: 'Submit' })
      await expect(page).toMatch('30 days')
    })
  })

  describe('Lock Embedd Code', () => {
    it('should toggle the embed code', async () => {
      await expect(page).toClick(`#LockEmbeddCode_${testLockAddress}`)
      await expect(page).toMatch('Code snippet')
    }, 10000)

    it('has a Preview dashboard button', async () => {
      await expect(page).toMatchElement(`#PreviewButton_${testLockAddress}`)
    }, 10000)
  })

  describe('Lock Editting', () => {
    it('a button exists to edit the Lock details', async () => {
      // await expect(page).toMatchElement(`#EditLockButton_${testLockAddress}`)
    })

    describe('editting the Lock price', () => {
      it('allows the lock owner to update the price of the lock', async () => {
        // await expect(page).toMatchElement(`#EditLockButton_${testLockAddress}`)
        // await expect(page).toClick(`#EditLockButton_${testLockAddress}`)
        // await expect(page).toMatchElement(
        //   `#KeyPriceEditField_${testLockAddress}`
        // )
        // await expect(page).toFill(
        //   `input[id="KeyPriceEditField_${testLockAddress}"]`,
        //   '0.33'
        // )
        // await expect(page).toClick('button', { text: 'Submit' })
      })
    })
  })
})
