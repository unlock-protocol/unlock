const url = require('../helpers/url')

describe('The Unlock Dashboard', () => {
  beforeAll(async () => {
    await page.goto(url('/dashboard'))
  })

  it('should load the creator dashboard', async () => {
    await expect(page).toMatch('Creator Dashboard')
  })

  it('should list the address of the current user', async () => {
    await expect(page).toMatch('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
  })

  it('should have a button allowing the creation of a Lock', async () => {
    const button = await page.waitFor('button')
    await expect(button).toMatch('Create Lock')
  })

  describe('Lock creation', () => {
    it('should display the lock creation form', async () => {
      await expect(page).toClick('button', { text: 'Create Lock' })
      await expect(page).toMatch('Submit')
      await expect(page).toMatch('Cancel')
      await expect(page).toMatch('days')
    })
  })
})
