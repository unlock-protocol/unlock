/**
 * Generates the message included in a signed metadata payload
 * @param {string} owner - The address of the lock owner
 * @param {Object.<string, string>} metadata - The data to store for this user
 */
export function generateMessage(owner, metadata) {
  return {
    KeyMetaData: {
      ...metadata,
      owner,
    },
  }
}

/**
 * Generates the data payload required to sign a request to store
 * metadata on a token by the lock owner
 * @param {string} owner - The address of the lock owner
 * @param {Object.<string, string>} metadata - The data to store for this user
 */
export function generateKeyMetadataPayload(owner, metadata) {
  const message = generateMessage(owner, metadata)

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
    message,
  }
}
