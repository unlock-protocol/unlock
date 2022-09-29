import ejectionWarningEmail from '../../templates/ejectionWarningEmail'

describe('ejectionWarningEmail', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(ejectionWarningEmail.subject()).toBe('Please withdraw your funds')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      ejectionWarningEmail.text({
        balance: 1080,
        dueDate: 'April 8, 2020',
      })
    ).toBe(
      `Hi there!

We've noticed that you're carrying a total balance of 1080 ETH on your locks at Unlock. You should consider withdrawing your funds to a safe wallet on another service.

Because Unlock isn't designed to store large amounts of funds for a long time, if you haven't withdrawn your balance by April 8, 2020, we will disconnect your account from the Unlock service.

Your funds are yours and you will be able to transfer them via a third-party tool. However, you won't be able to access them from the Unlock service.

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })
})
