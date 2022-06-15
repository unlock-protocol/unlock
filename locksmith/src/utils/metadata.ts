export interface KeyMetadataPayload {
  types: {
    EIP712Domain: { name: string; type: string }[]
    KeyMetadata: any[]
  }
  domain: {
    name: string
    version: string
  }
  primaryType: string
  message: {
    KeyMetaData: any
  }
}

export function generateMessage(owner: string, metadata: any) {
  return {
    KeyMetaData: {
      ...metadata,
      owner,
    },
  }
}

export function generateKeyMetadataPayload({
  metadata,
  viewer,
}: {
  metadata: string
  viewer: string
}): KeyMetadataPayload {
  const message = generateMessage(viewer, metadata)
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      KeyMetadata: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'KeyMetadata',
    message: message,
  }
}
