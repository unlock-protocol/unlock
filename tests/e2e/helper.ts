import type {
  Dappeteer,
  DappeteerBrowser,
  DappeteerPage,
} from '@chainsafe/dappeteer'
import puppeteer from 'puppeteer'
import dappeteer from '@chainsafe/dappeteer'

// todo: use env
const E2E_METAMASK_SEED =
  'tiny question spoil sugar alcohol harsh high approve energy relief lobster trade'
const E2E_METAMASK_PASSWORD = 'password'

const HOST = process.env.UNLOCK_APP_URL || `http://127.0.0.1:3000`

const DEFAULT_TIMEOUT = 5000
/**
 * Helper `launch` function to install metamask and login before every test, this export all the things we need for the tests
 * @summary Launch setup and metamask + puppeteer for test
 * @return
 */

export interface App {
  HOST: string
  browser: DappeteerBrowser
  page: DappeteerPage
  metamask: Dappeteer
  stop: () => void
  connect: () => void
  url: (path: string) => string
}

export async function launch(): Promise<App> {
  const browser = await dappeteer.launch(puppeteer as any)
  const metamask = await dappeteer.setupMetaMask(browser, {
    seed: E2E_METAMASK_SEED,
    password: E2E_METAMASK_PASSWORD,
  })
  await metamask.switchNetwork('goerli') // todo: change to localhost
  const page = await browser.newPage()

  return {
    HOST,
    browser: browser!,
    metamask: metamask!,
    page: page,
    async stop() {
      await browser.close()
    },
    async connect() {
      // accept privacy terms
      await page.waitForTimeout(250)
      const termsSelector = '[data-testid="accept-terms"]'
      await page.waitForSelector(termsSelector, {
        timeout: DEFAULT_TIMEOUT,
        visible: true,
      })
      const $terms = await page.$(termsSelector)
      await $terms?.click()

      await page.waitForTimeout(1000)
      const connectSelector = '[data-testid="connect"]'
      await page.waitForSelector(connectSelector, {
        visible: true,
        timeout: DEFAULT_TIMEOUT,
      })
      const $connect = await page.$(connectSelector)
      await $connect?.click()

      // connect metamask to dapp
      await page.waitForTimeout(1000)
      const connectMetamaskSelector =
        '[data-testid="connect-in-browser-wallet"]'
      await page.waitForSelector(connectMetamaskSelector, {
        timeout: DEFAULT_TIMEOUT,
        visible: true,
      })
      const $connectMetamask = await page.$(connectMetamaskSelector)
      await $connectMetamask?.click()

      // approve metamask connection
      await page.waitForTimeout(DEFAULT_TIMEOUT)
      await metamask.approve()

      await page.bringToFront()
    },
    url(path: string): string {
      const url = new URL(path, HOST)
      return url.toString()
    },
  }
}
