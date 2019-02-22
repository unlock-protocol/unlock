export default class UnlockLock {
  static build(input) {
    let domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    let lock = [
      { name: 'name', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'address', type: 'address' },
    ]

    let domainData = {
      name: 'Unlock Dashboard',
      version: '1',
    }

    let message = {
      lock: {
        name: input.name,
        owner: input.owner,
        address: input.address,
      },
    }

    return {
      types: {
        EIP712Domain: domain,
        Lock: lock,
      },
      domain: domainData,
      primaryType: 'Lock',
      message: message,
    }
  }
}
