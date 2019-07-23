const wait = require('../helpers/wait')
const url = require('../helpers/url').newdemo

describe('Unlock Account Creation', () => {
  describe('when visiting a locked page without a wallet', () => {
    it('displays a login modal', async () => {
      expect.assertions(4)
      await page.goto(url('0x8276A24C03B7ff9307c5bb9c0f31aa60d284375f'))

      await wait.forIframe()
      const loginIframe = page.mainFrame().childFrames()[1]
      let content = await loginIframe.content()

      await expect(content).toMatch('Log In')
      await expect(content).toMatch('Email')
      await expect(content).toMatch('Password')
      await expect(content).toMatch("Don't have an account?")
    })
  })

  describe('Sign up modal', () => {
    it("Accepts a user's email address", async () => {
      expect.assertions(2)
      await page.goto(url('0x8276A24C03B7ff9307c5bb9c0f31aa60d284375f'))
      await wait.forIframe()
      const loginIframe = page.mainFrame().childFrames()[1]

      await loginIframe.$eval('.LogIn__LinkButton-sc-1szml39-6', el =>
        el.click()
      )
      let content = await loginIframe.content()
      expect(content).toMatch('Create an Account to Pay by Credit Card')

      let emailAddress = await loginIframe.$('#emailAddress')
      await emailAddress.type('test@example.com')

      await loginIframe.$eval('.SignUp__SubmitButton-sc-1wtz6rs-5', el =>
        el.click()
      )

      content = await loginIframe.content()
      expect(content).toMatch('Please check your email')
    })
  })
})
