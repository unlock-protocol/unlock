/**
 * @typedef {Object} metadata
 * @property {Object.<string, string>} [publicData={}] - Publicly available metadata
 * @property {Object.<string, string>} [protectedData={}] - Restricted access metadata
 */

/**
 * Generates the message included in a signed metadata payload
 * @param {string} owner - The address of the keyholder
 * @param {metadata} metadata - The data to store for this user
 */
export function generateMessage(owner, metadata) {
  const { publicData = {}, protectedData = {} } = metadata
  return {
    UserMetaData: {
      owner,
      data: {
        public: publicData,
        protected: protectedData,
      },
    },
  }
}

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
      UserMetaData: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'UserMetaData',
    message,
    messageKey: 'UserMetaData',
  }
}
