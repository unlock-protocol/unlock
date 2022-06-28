export default class UnlockUser {
  static build(input) {
    const domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    const user = [
      { name: 'emailAddress', type: 'string' },
      { name: 'publicKey', type: 'address' },
      { name: 'passwordEncryptedPrivateKey', type: 'string' },
    ]

    const domainData = {
      name: 'Unlock',
      version: '1',
    }

    const message = {
      user: {
        emailAddress: input.emailAddress,
        publicKey: input.publicKey,
        passwordEncryptedPrivateKey: input.passwordEncryptedPrivateKey,
      },
    }

    return {
      types: {
        User: user,
      },
      domain: domainData,
      primaryType: 'User',
      message,
      messageKey: 'user',
    }
  }
}
