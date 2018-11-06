import config from '../helpers/app.config'

describe('Unlock', () => {
  beforeAll(async () => {
    jest.setTimeout(10000)
    await page.goto(config.url('/'))
  })

  it('should display "unlock" text on page', async () => {
    await expect(page).toMatch('Unlock')
  })
})
