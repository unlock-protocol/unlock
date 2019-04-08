export default class UnlockPurchaseRequest {
  static build(input) {
    let domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    let purchaseRequest = [
      { name: 'recipient', type: 'address' },
      { name: 'lock', type: 'address' },
      { name: 'expiry', type: 'uint64' },
    ]

    let domainData = {
      name: 'Unlock',
      version: '1',
    }

    let message = {
      purchaseRequest: {
        recipient: input.recipient,
        lock: input.lock,
        expiry: input.expiry,
      },
    }

    return {
      types: {
        EIP712Domain: domain,
        PurchaseRequest: purchaseRequest,
      },
      domain: domainData,
      primaryType: 'PurchaseRequest',
      message: message,
    }
  }
}
