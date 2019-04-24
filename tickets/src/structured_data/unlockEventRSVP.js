export default class UnlockEventRSVP {
  static build(input) {
    let domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    let rsvp = [
      { name: 'eventAddress', type: 'string' },
      { name: 'publicKey', type: 'address' },
    ]

    let domainData = {
      name: 'Unlock',
      version: '1',
    }

    let message = {
      address: {
        eventAddress: input.eventAddress,
        publicKey: input.publicKey,
      },
    }

    return {
      types: {
        EIP712Domain: domain,
        RSVP: rsvp,
      },
      domain: domainData,
      primaryType: 'RSVP',
      message: message,
    }
  }
}
