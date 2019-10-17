export default class UnlockEvent {
  static build(input) {
    let domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ]

    let event = [
      { name: 'lockAddress', type: 'address' },
      { name: 'owner', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'location', type: 'string' },
      { name: 'date', type: 'uint64' },
      { name: 'logo', type: 'string' },
      { name: 'image', type: 'string' },
      { name: 'duration', type: 'uint64' },
      { name: 'links', type: 'string' },
    ]

    let domainData = {
      name: 'Unlock',
      version: '1',
    }

    let message = {
      event: {
        lockAddress: input.lockAddress,
        owner: input.owner,
        name: input.name,
        description: input.description,
        location: input.location,
        date: input.date,
        logo: input.logo,
        image: input.image,
        duration: input.duration,
        links: input.links,
      },
    }

    return {
      types: {
        EIP712Domain: domain,
        Event: event,
      },
      domain: domainData,
      primaryType: 'Event',
      message: message,
    }
  }
}
