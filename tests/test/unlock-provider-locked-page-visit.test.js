const wait = require('../helpers/wait')
const url = require('../helpers/url').newdemo

describe('Unlock Account Creation', () => {
  describe('when visiting a locked page without a wallet', () => {
    it('displays a login modal', async () => {
      expect.assertions(4)
      await page.goto(
        url('0x8276A24C03B7ff9307c5bb9c0f31aa60d284375f') +
          '&unlockUserAccounts=true'
      )
      await wait.forIframe()
      const loginIframe = page.mainFrame().childFrames()[1]
      let content = await loginIframe.content()

      await expect(content).toMatch('Log In')
      await expect(content).toMatch('Email')
      await expect(content).toMatch('Password')
      await expect(content).toMatch("Don't have an account?")
    })
  })
})
