const url = require('../helpers/url').main

jest.setTimeout(30000)

describe('The Unlock Keychain', () => {
  beforeAll(async () => {
    await page.goto(url('/keychain'))
  })

  it('should load the key chain', async () => {
    await expect(page).toMatch('Key Chain')
  })
})
