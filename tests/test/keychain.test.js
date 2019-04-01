const url = require('../helpers/url').main

describe('The Unlock Keychain', () => {
  beforeAll(async () => {
    await page.goto(url('/keychain'))
  })

  it('should load the key chain', async () => {
    await expect(page).toMatch('Key Chain')
  })
})
