// const url = require('../helpers/url').main

describe('The Login Page', () => {
  it('it loads the login module', async () => {
    expect.assertions(1)
    await page.goto('http://unlock-provider-unlock-app:9000/account')
    await expect(page).toMatch('Log In')
  })
})
