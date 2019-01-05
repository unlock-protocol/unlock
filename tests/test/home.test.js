const url = require('../helpers/url')

describe('Unlock', () => {

  it('should display "unlock" text on page', async () => {
    jest.setTimeout(100000)
    const page = await browser.newPage()
    await page.goto(url('/'))
    await expect(page).toMatch('Unlock')
  })
})
