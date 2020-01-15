/**
 * @typedef {Object} metadata
 * @property {Object.<string, string>} [publicData={}] - Publicly available metadata
 * @property {Object.<string, string>} [privateData={}] - Restricted access metadata
 */

/**
 * Generates the data payload required to sign a request to store
 * metadata on a token for a keyholder
 * @param {string} owner - The address of the keyholder
 * @param {metadata} metadata - The data to store for this user
 */
export function generateKeyHolderMetadataPayload(owner, metadata) {
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
      UserMetaData: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'UserMetaData',
    message: message,
  }
}

/**
 * Generates the message included in a signed metadata payload
 * @param {string} owner - The address of the keyholder
 * @param {metadata} metadata - The data to store for this user
 */
export function generateMessage(owner, metadata) {
  const { publicData = {}, privateData = {} } = metadata
  return {
    UserMetaData: {
      owner,
      data: {
        public: publicData,
        private: privateData,
      },
    },
  }
}
