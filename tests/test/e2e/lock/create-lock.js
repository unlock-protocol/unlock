const puppeteer = require('puppeteer')
const dappeteer = require('@chainsafe/dappeteer')
const { bootstrap } = require('./../helper')
//const { getAppConfig } = require('./../../config/app')

const baseUrl = ''
async function login() {
  const { browser, metamask, page } = await bootstrap()
  // go to login page and connect with metamask
  //const app = getAppConfig(process.env.NEXT_PUBLIC_UNLOCK_ENV || 'dev')

  // todo: use env for url
  await page.goto(`http://127.0.0.1:3000/locks`, {
    waitUntil: 'networkidle',
  })
  const connectWalletButton = await page.$(
    '[data-testid="connect-in-browser-wallet"]'
  )
  await connectWalletButton.click()
  await metamask.approve()

  // todo: use env
  await page.goto(`http://127.0.0.1:3000/locks/create`, {
    waitUntil: 'networkidle',
  })

  await metamask.confirmTransaction()
}

login()
