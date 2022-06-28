export default class UnlockPurchaseRequest {
  static build(input) {
    const domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    const purchaseRequest = [
      { name: 'recipient', type: 'address' },
      { name: 'lock', type: 'address' },
      { name: 'expiry', type: 'uint64' },
    ]

    const domainData = {
      name: 'Unlock',
      version: '1',
    }

    const message = {
      purchaseRequest: {
        recipient: input.recipient,
        lock: input.lock,
        expiry: input.expiry,
      },
    }

    return {
      types: {
        PurchaseRequest: purchaseRequest,
      },
      domain: domainData,
      primaryType: 'PurchaseRequest',
      message,
      messageKey: 'purchaseRequest',
    }
  }
}
