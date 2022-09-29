import ejectedEmail from '../../templates/ejectedEmail'

describe('ejectedEmail', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(ejectedEmail.subject()).toBe('Your account has been disconnected')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      ejectedEmail.text({
        balance: 1080,
      })
    ).toBe(
      `Hi there!

Because your account has continued to carry a total balance of 1080 ETH on your locks at Unlock, we have disconnected it from our service. This is for your safety, because Unlock isn't designed to store large amounts of funds for a long time.

Your funds are yours and you can still transfer them via a third-party tool. However, you won't be able to access them from the Unlock service.

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })
})
