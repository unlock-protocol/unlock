export default {
  subject: () => 'A key was added to your wallet!',
  text: (params) =>
    `Hello!

A new key to the lock "${params.lockName}" was just mined for you!
It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!

Check out your keychain: ${params.keychainUrl}

If you have any questions (or if you do not want to receive emails like this one in the future), please email us at hello@unlock-protocol.com.

The Unlock team
`,
}
