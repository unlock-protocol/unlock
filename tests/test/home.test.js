const url = require('../helpers/url').main

describe('The Unlock Homepage', () => {
  it('should display "unlock" text on page', async () => {
    const page = await browser.newPage()
    await page.goto(url('/'))
    await expect(page).toMatch('Unlock')
  })

  it('should display a go to dashboard button on the page', async () => {
    const page = await browser.newPage()
    await page.goto(url('/'))
    const button = await page.waitFor('button')
    await expect(button).toMatch('Go to Your Dashboard')
  })

  it('should display the Terms of Service and Privacy Policy links when tapping through to the dashboard', async () => {
    const page = await browser.newPage()
    await page.goto(url('/'))
    const button = await page.waitFor('button')
    await button.click()
    await expect(page).toMatch('Terms of Service')
    await expect(page).toMatch('Privacy Policy')
  })
})
