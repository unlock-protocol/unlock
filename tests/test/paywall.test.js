const url = require('../helpers/url')
const wait = require('../helpers/wait')
const lockAddresses = require('../helpers/locks')

//const lockName = 'ETH paywall lock'
const lockKeyPrice = '0.1'

let lockSelector

describe('The Unlock Paywall', () => {
  beforeAll(async () => {
    // This lock is created in /docker/development/deploy-locks.js
    // after the comment "locks for paywall integration tests"
    const lock = lockAddresses.paywallETHLockAddress

    lockSelector = path => {
      return `[data-address="${lock}"] ${path}`
    }
    await page.goto(url.paywall(`/demo/${lock}`), { waitUntil: 'networkidle2' })
  })

  it('should remove the blocker', async () => {
    expect.assertions(0)
    await page.waitForFunction(
      () => !document.querySelector('#_unlock_blocker')
    )
  })

  it('should display the lock with the right price', async () => {
    expect.assertions(1)
    await wait.forIframe()
    const paywallIframe = page.mainFrame().childFrames()[0]
    await paywallIframe.waitForSelector(lockSelector(''))
    const priceOnPaywall = await paywallIframe.evaluate(ethPriceSelector => {
      return document.querySelector(ethPriceSelector).innerText
    }, lockSelector('.price'))
    expect(priceOnPaywall).toEqual(`${lockKeyPrice} ETH`)
  })

  it('scrolling is disabled', async () => {
    expect.assertions(1)
    // scroll the page prior to the paywall displaying
    await page.evaluate(() => {
      window.scrollBy(0, 200)
    })
    await wait.forIframe()
    const paywallIframe = page.mainFrame().childFrames()[0]
    await paywallIframe.waitForSelector('.headline')
    const headlineLocation = await paywallIframe.evaluate(
      () => document.querySelector('.headline').getBoundingClientRect().top
    )
    // paywall has grown to hide the content.
    // actual value of the headline is 45.390625
    // when scrolling has not happened, it is 270.39062
    // so this assertion should be safe in all future cases
    expect(headlineLocation).toBeLessThan(50)
  })

  it('clicking the lock purchases a key', async () => {
    expect.assertions(1)
    const paywallIframe = page.mainFrame().childFrames()[0]
    const paywallBody = await paywallIframe.$('body')
    await expect(paywallBody).toClick(lockSelector(''))
    // TODO add tests when doing optimistic unlocking
  })

  // TODO add tests for pessimistic unlocking

  it('after key purchase, unlocked flag appears', async () => {
    expect.assertions(0)
    await page.reload()
    await wait.forIframe()
    const paywallIframe = page.mainFrame().childFrames()[0]
    await paywallIframe.waitForFunction(() => {
      const unlockFlag = document.querySelector('.flag')
      if (!unlockFlag) return false
      return true
    })
  })
})
