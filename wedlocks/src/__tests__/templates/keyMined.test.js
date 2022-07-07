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

A new NFT key (#1337) to the lock "Ethereal NYC 202" was just mined for you!
It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!

Check out your keychain: https://app.unlock-protocol.com/keychain
Make sure you select the network NETWORK where the the NFT has been minted for you.

If you have any questions (or if you do not want to receive emails like this one in the future), please email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })

  it('should have the right text and links', () => {
    expect.assertions(1)
    expect(
      keyMined.text({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        txUrl: 'http://txurl.com',
        openSeaUrl: 'http://opensealurl.com',
      })
    ).toBe(
      `Hello!

A new NFT key (#1337) to the lock "Ethereal NYC 202" was just mined for you!
It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!

Check out your keychain: https://app.unlock-protocol.com/keychain
Make sure you select the network NETWORK where the the NFT has been minted for you.

You can also see it on a block explorer like http://txurl.com or even OpenSea http://opensealurl.com.

If you have any questions (or if you do not want to receive emails like this one in the future), please email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })

  it('should have the right text and have only tx url', () => {
    expect.assertions(1)
    expect(
      keyMined.text({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        txUrl: 'http://txurl.com',
      })
    ).toBe(
      `Hello!

A new NFT key (#1337) to the lock "Ethereal NYC 202" was just mined for you!
It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!

Check out your keychain: https://app.unlock-protocol.com/keychain
Make sure you select the network NETWORK where the the NFT has been minted for you.

You can also see it on a block explorer http://txurl.com.

If you have any questions (or if you do not want to receive emails like this one in the future), please email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })

  it('should have the right text and have only tx open sea url', () => {
    expect.assertions(1)
    expect(
      keyMined.text({
        keyId: '1337',
        lockName: 'Ethereal NYC 202',
        keychainUrl: 'https://app.unlock-protocol.com/keychain',
        openSeaUrl: 'http://opensealurl.com',
      })
    ).toBe(
      `Hello!

A new NFT key (#1337) to the lock "Ethereal NYC 202" was just mined for you!
It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!

Check out your keychain: https://app.unlock-protocol.com/keychain
Make sure you select the network NETWORK where the the NFT has been minted for you.

You can also see it on OpenSea http://opensealurl.com.

If you have any questions (or if you do not want to receive emails like this one in the future), please email us at hello@unlock-protocol.com.

The Unlock team
`
    )
  })
})
