export default class KeyPurchaseRequest {
  static build(input) {
    let domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    let keyPurchaseRequest = [
      { name: 'recipient', type: 'address' },
      { name: 'lock', type: 'address' },
      { name: 'expiry', type: 'uint256' },
    ]

    let domainData = {
      name: 'Unlock Dashboard',
      version: '1',
    }

    let message = {
      request: {
        recipient: input.recipient,
        lock: input.lock,
        expiry: 60, // default to one-minute expiry of signature
      },
    }

    return {
      types: {
        EIP712Domain: domain,
        KeyPurchaseRequest: keyPurchaseRequest,
      },
      domain: domainData,
      primaryType: 'KeyPurchaseRequest',
      message: message,
    }
  }
}
