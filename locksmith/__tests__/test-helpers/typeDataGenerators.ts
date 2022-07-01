export function lockTypedData(message: any, messageKey: string) {
  return {
    types: {
      LockMetadata: [
        { name: 'address', type: 'address' },
        { name: 'owner', type: 'address' },
        { name: 'timestamp', type: 'uint256' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'LockMetadata',
    message,
    messageKey,
  }
}

export function keyTypedData(message: any, messageKey: string) {
  return {
    types: {
      KeyMetadata: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'KeyMetadata',
    message,
    messageKey,
  }
}
