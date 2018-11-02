
describe('Unlock', () => {

  it('should display "unlock" text on page', async () => {
    jest.setTimeout(100000)
    const page = await browser.newPage()
    await page.goto('http://0.0.0.0:3000/')
    await expect(page).toMatch('Unlock')
  })
})
