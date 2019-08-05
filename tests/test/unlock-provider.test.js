const url = require('../helpers/url')

describe('The Login Page', () => {
  it('it loads the login module', async () => {
    expect.assertions(1)
    await page.goto(url.unlockProviderApp('/account'))
    await expect(page).toMatch('Log In')
  })
})
