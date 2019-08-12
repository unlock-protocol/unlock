const url = require('../helpers/url')
const wait = require('../helpers/wait')
// const debug = require('../helpers/debugging')
const iframes = require('../helpers/iframes')
const { adblockERC20LockAddresses } = require('../helpers/vars')

// const it = debug.screenshotOnFail(page)

let lockSelectors
/*
to debug this test locally, run the dev standup (see the README.md in the root directory)

then, paste the code between the "```" into the console in a browser without metamask (like Safari):

```
var locks = [
  {
    address: '0x1c0E27f7967899578eF138384F8cFC0bf579d063'.toLowerCase(),
    name: 'Lock 1',
  },
  {
    address: '0xce341cc78D9774808f0E5b654aF8B57B5126C6BA'.toLowerCase(),
    name: 'Lock 2',
  },
  {
    address: '0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5'.toLowerCase(),
    name: 'Lock 3',
  },
]
var url = `http://localhost:3001/static/adremover/integrationtesting-loggedin.html?locks=${encodeURIComponent(
  JSON.stringify(locks)
)}&paywall=${encodeURIComponent(
  'http://localhost:3001'
)}&provider=${encodeURIComponent('http://localhost:8545')}&logindelay=0`
window.location.href = url
```

this will allow exploring why the test has failed
*/

const locks = [
  {
    address: adblockERC20LockAddresses[0].toLowerCase(),
    name: 'Lock 1',
    keyPrice: '1.00',
    expirationDuration: '7',
  },
  {
    address: adblockERC20LockAddresses[1].toLowerCase(),
    name: 'Lock 2',
    keyPrice: '5.00',
    expirationDuration: '30',
  },
  {
    address: adblockERC20LockAddresses[2].toLowerCase(),
    name: 'Lock 3',
    keyPrice: '100.00',
    expirationDuration: '365',
  },
]

const unlockIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDI1NiI+CiAgPHBhdGggZD0iTTQ0OS45Mzk4OCwyMzAuMDUzNzFoNTMuMDRWMGgtNTMuMDRaTTIxNS4xMDIsMTUuOTc2MDdIMTU5LjUwNThWNzEuNTgzODZINzAuNjc5NjNWMTUuOTc2MDdIMTUuMDgzVjcxLjU4Mzg2SDBWOTguMDA0MTVIMTUuMDgzdjQxLjYyNTczYzAsNTIuMDgxNTUsNDUuMDUyMjQsOTQuNTc3NjQsMTAwLjMyOTEsOTQuNTc3NjQsNTQuOTU3LDAsOTkuNjg5OTQtNDIuNDk2MDksOTkuNjg5OTQtOTQuNTc3NjRWOTguMDA0MTVoMTQuOTY0VjcxLjU4Mzg2SDIxNS4xMDJaTTE1OS41MDU4LDEzOS42Mjk4OGMwLDI0LjYwMy0xOS40OTA3Miw0NC43MzI0Mi00NC4wOTM3NSw0NC43MzI0MmE0NC44NjM2Nyw0NC44NjM2NywwLDAsMS00NC43MzI0Mi00NC43MzI0MlY5OC4wMDQxNUgxNTkuNTA1OFpNMzQ4LjY1NjY4LDY3LjA5OTEyYy0xOS4xNzEzOSwwLTM3LjcwMzYyLDguNjI3LTQ4LjI0NzU2LDI0LjI4MzJIMjk5Ljc3bC0zLjE5NDgzLTE5LjgxMDA1aC00Ni42NDk5VjIzMC4wNTM3MWg1My4wNHYtODIuNDM2YzAtMTguMjEyNDEsMTQuMDU5MDgtMzIuOTEwMTYsMzAuOTkzNjUtMzIuOTEwMTYsMTcuNTczMjUsMCwzMS4zMTI1LDE0LjY5Nzc1LDMxLjMxMjUsMzIuMjcxNDh2ODMuMDc0NzFoNTMuMDR2LTg4LjE4N0M0MTguMzExNDYsOTkuNjg5OTQsMzkxLjQ3MjExLDY3LjA5OTEyLDM0OC42NTY2OCw2Ny4wOTkxMlptNjgwLjg3Njk1LDc3LjMyMzI0LDY1LjE4MTY0LTcyLjg1MDA5aC02NS41MDFsLTUxLjEyMyw1OS40MzA2NmgtLjk1OVYwaC01My4wNFYyMzAuMDUzNzFoNTMuMDRWMTU3Ljg0MjI5aC45NTlsNTIuNzIwNyw3Mi4yMTE0Mmg2Ni43NzkzWk02MTMuMjA4NDQsNjcuMDk5MTJjLTQ5LjUyNTQsMC05MC40MjM4MywzNy43MDMxMy05MC40MjM4Myw4My43MTM4N3M0MC44OTg0Myw4My4zOTQ1Myw5MC40MjM4Myw4My4zOTQ1Myw5MC40MjM4Mi0zNy4zODM3OSw5MC40MjM4Mi04My4zOTQ1M1M2NjIuNzMzODMsNjcuMDk5MTIsNjEzLjIwODQ0LDY3LjA5OTEyWm0wLDEyMC43NzgzMmMtMjAuMTI5ODksMC0zNy4wNjQ0Ni0xNi45MzQ1Ny0zNy4wNjQ0Ni0zNy4wNjQ0NXMxNi45MzQ1Ny0zNy4wNjQ0NSwzNy4wNjQ0Ni0zNy4wNjQ0NSwzNy4zODM3OCwxNi45MzQ1NywzNy4zODM3OCwzNy4wNjQ0NVM2MzMuMzM4MzIsMTg3Ljg3NzQ0LDYxMy4yMDg0NCwxODcuODc3NDRaTTgxNC44MTg3OSwxMTMuNDI5MmMxNS42NTYyNSwwLDI4LjQzNzUsOC45NDY3OCwzMy4yMzA0NywyMS40MDc3MWg1My45OThjLTUuNDMxNjQtMzcuMDY0LTQxLjUzNzExLTY3LjczNzc5LTg2LjI2OTUzLTY3LjczNzc5LTQ5Ljg0NTcsMC05MS4wNjM1LDM3LjcwMzEzLTkxLjA2MzUsODMuNzEzODdzNDEuMjE3OCw4My4zOTQ1Myw5MS4wNjM1LDgzLjM5NDUzYzQzLjc3MzQ0LDAsODEuMTU3MjMtMjkuMzk2LDg2LjI2OTUzLTY4LjA1NzYyaC01My45OThjLTUuNzUyLDEzLjEwMDEtMTcuNTc0MjIsMjEuNDA3NzItMzMuMjMwNDcsMjEuNDA3NzJBMzYuOTU1MSwzNi45NTUxLDAsMCwxLDc3OC4wNzQ2NSwxNTAuODEzQzc3OC4wNzQ2NSwxMzAuNjgzMTEsNzk0LjM2OTU3LDExMy40MjkyLDgxNC44MTg3OSwxMTMuNDI5MloiLz4KPC9zdmc+Cg=='

describe('The Unlock Ad Remover Paywall (logged in user)', () => {
  beforeAll(async () => {
    const addresses = adblockERC20LockAddresses.map(address =>
      address.toLowerCase()
    )

    lockSelectors = addresses.map(lock => path =>
      `[data-address="${lock}"] ${path}`
    )
    // debug.debugPage(page, true)
    const testUrl = url.paywall(
      `/static/adremover/integrationtesting-loggedin.html?locks=${encodeURIComponent(
        JSON.stringify(locks)
      )}&paywall=${encodeURIComponent(
        url.paywall('')
      )}&provider=${encodeURIComponent(url.readOnlyProvider())}&logindelay=0`
    )
    await page.goto(testUrl, { waitUntil: 'networkidle2' })
  })

  it('should open the checkout UI when clicking on the button', async () => {
    expect.assertions(1)
    await wait.forIframe(2) // wait for 2 iframes to be loaded, the data and checkout iframes
    await expect(page).toClick('button', {
      text: 'Unlock the ads free experience!',
    })
    // "show" is the classname that shows the checkout UI
    await page.$('iframe[class="unlock start show"]')
  })

  it('should show the logo on the checkout UI', async () => {
    expect.assertions(0)
    await wait.forIframe(2) // wait for 2 iframes to be loaded, the data and checkout iframes
    const checkoutIframe = iframes.checkoutIframe(page)
    await checkoutIframe.waitForFunction(
      unlockIcon => {
        return !!document.body.querySelector(`img[src="${unlockIcon}"]`)
      },
      {},
      unlockIcon
    )
  })

  it('should show the 3 locks', async () => {
    expect.assertions(0)
    await wait.forIframe(2) // wait for 2 iframes to be loaded, the data and checkout iframes
    const checkoutIframe = iframes.checkoutIframe(page)
    for (let i = 0; i < lockSelectors.length; i++) {
      await checkoutIframe.waitForFunction(
        lock => {
          return !!document.body.querySelector(lock)
        },
        {},
        lockSelectors[i]('')
      )
    }
  })

  it('should show the correct price for the 3 locks', async () => {
    expect.assertions(3)
    await wait.forIframe(2) // wait for 2 iframes to be loaded, the data and checkout iframes
    const checkoutIframe = iframes.checkoutIframe(page)
    const getPrice = priceSelector =>
      document.body.querySelector(priceSelector).innerText
    for (let i = 0; i < lockSelectors.length; i++) {
      const price = await checkoutIframe.evaluate(
        getPrice,
        lockSelectors[i]('.price')
      )
      expect(price).toBe(`${locks[i].keyPrice} DEV`)
    }
  })

  it('should attempt a key purchase when clicking on a lock, and hide the ads', async () => {
    expect.assertions(2)
    await wait.forIframe(2) // wait for 2 iframes to be loaded, the data and checkout iframes
    const checkoutIframe = iframes.checkoutIframe(page)
    const checkoutBody = await checkoutIframe.$('body')
    await expect(checkoutBody).toClick(lockSelectors[0](''))
    await checkoutIframe.waitForFunction(
      lock1 => {
        const lock = document.body.querySelector(lock1)
        return (
          lock &&
          (lock.innerText === 'Payment Sent' ||
            lock.innerText === 'Payment Pending')
        )
      },
      {},
      lockSelectors[0]('footer')
    )
    const adDisplay = await page.$$eval('.ad', ads => {
      return ads.map(ad => ad.style.display)
    })
    expect(adDisplay).toEqual(['none', 'none'])
  })

  it('should continue monitoring the transaction after refresh, ads still hidden', async () => {
    expect.assertions(2)
    await page.reload()
    await wait.forIframe(2) // wait for 2 iframes to be loaded, the data and checkout iframes
    await expect(page).toClick('button', {
      text: 'Unlock the ads free experience!',
    })
    const checkoutIframe = iframes.checkoutIframe(page)
    await checkoutIframe.waitForFunction(
      lock1 => {
        const lock = document.body.querySelector(lock1)
        return (
          lock &&
          (lock.innerText === 'Payment Sent' ||
            lock.innerText === 'Payment Pending')
        )
      },
      {},
      lockSelectors[0]('footer')
    )
    const adDisplay = await page.$$eval('.ad', ads => {
      return ads.map(ad => ad.style.display)
    })
    expect(adDisplay).toEqual(['none', 'none'])
  })

  it('should hide the iframe when purchase is confirmed, ads still hidden', async () => {
    expect.assertions(1)
    // wait for 2 iframes to be loaded, the data and checkout iframes
    await wait.forIframe(2)
    // wait for the key purchase to be confirmed, and then the modal will dismiss
    await wait.untilIsGone('iframe[class="unlock start show"]')
    const adDisplay = await page.$$eval('.ad', ads => {
      return ads.map(ad => ad.style.display)
    })
    expect(adDisplay).toEqual(['none', 'none'])
  })
})
