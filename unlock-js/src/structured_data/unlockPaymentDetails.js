export default class UnlockPaymentDetails {
  static build(input) {
    let domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    let user = [
      { name: 'emailAddress', type: 'string' },
      { name: 'publicKey', type: 'address' },
      { name: 'token', type: 'string' },
    ]

    let domainData = {
      name: 'Unlock',
      version: '1',
    }

    let message = {
      user: {
        emailAddress: input.emailAddress,
        publicKey: input.publicKey,
        token: input.token,
      },
    }

    return {
      types: {
        EIP712Domain: domain,
        User: user,
      },
      domain: domainData,
      primaryType: 'User',
      message: message,
    }
  }
}
