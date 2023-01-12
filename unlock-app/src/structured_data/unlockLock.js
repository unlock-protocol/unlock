export default class UnlockLock {
  static build(input) {
    const domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    const lock = [
      { name: 'name', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'address', type: 'address' },
    ]

    const domainData = {
      name: 'Unlock Dashboard',
      version: '1',
    }

    const message = {
      lock: {
        name: input.name,
        owner: input.owner,
        address: input.address,
      },
    }

    return {
      types: {
        Lock: lock,
      },
      domain: domainData,
      primaryType: 'Lock',
      message,
      messageKey: 'lock',
    }
  }
}
