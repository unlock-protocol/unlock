const puppeteer = require('puppeteer')
const dappeteer = require('@chainsafe/dappeteer')

// todo: use env
const E2E_METAMASK_SEED =
  'tiny question spoil sugar alcohol harsh high approve energy relief lobster trade'
const E2E_METAMASK_PASSWORD = 'password'

// launch setup and login with metamask
async function bootstrap() {
  const browser = await dappeteer.launch(puppeteer)

  const metamask = await dappeteer.setupMetaMask(browser, {
    seed: E2E_METAMASK_SEED,
    password: E2E_METAMASK_PASSWORD,
  })

  const page = await browser.newPage()

  return {
    browser,
    metamask,
    page,
  }
}

module.exports = {
  bootstrap,
}
