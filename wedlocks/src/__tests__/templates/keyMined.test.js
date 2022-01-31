import keyMined from '../../templates/keyMined'

describe('keyMined', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      keyMined.subject({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
      })
    ).toBe('A key was added to your wallet!')
  })

  it('should have the right text', () => {
    expect.assertions(1)
    expect(
      keyMined.text({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
      })
    ).toBe(
      `Hello!

A new key to the lock "Ethereal NYC 202" was just mined for you!
It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!

Check out your keychain: https://app.unlock-protocol.com/keychain

If you have any questions (or if you do not want to receive emails like this one in the future), please email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })
})
