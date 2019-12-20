const wait = require('../helpers/wait')
const url = require('../helpers/url')
const iframes = require('../helpers/iframes')

describe('Unlock Account Creation', () => {
  describe('when visiting a locked page without a wallet', () => {
    it('displays a login modal', async () => {
      expect.assertions(4)
      const locks = [
        {
          address: '0x8276A24C03B7ff9307c5bb9c0f31aa60d284375f',
        },
      ]
      // this is the only page on the paywall app that does not have an http provider wallet enabled
      // and so it is best for testing user accounts
      await page.goto(
        url.paywall(
          `/static/adremover/integrationtesting-loggedout.html?locks=${encodeURIComponent(
            JSON.stringify(locks)
          )}&paywall=${encodeURIComponent(
            url.paywall('')
          )}&unlockUserAccounts=1`
        ),
        { waitUntil: 'networkidle2' }
      )
      await wait.forIframe(2) // wait for 2 iframes to be loaded, the data and checkout iframes
      const loginIframe = iframes.accountsIframe(page)
      let content = await loginIframe.content()

      await expect(content).toMatch('Log In')
      await expect(content).toMatch('Email')
      await expect(content).toMatch('Password')
      await expect(content).toMatch("Don't have an account?")
    })
  })
})
