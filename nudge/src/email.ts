import request from 'request-promise-native'

const config = require('../config/config')

export class Email {
  static async dispatch(key: Key): Promise<boolean> {
    let body = {
      template: 'keyMined',
      recipient: key.emailAddress,
      params: {
        keyId: key.keyId,
        lockName: key.lockName,
        keychainUrl: 'https://app.unlock-protocol.com/keychain/',
      },
    }

    let options = {
      body,
      json: true,
      method: 'POST',
      uri: config.wedlocksURI,
      resolveWithFullResponse: true,
    }

    let dispatchResponse = await request(options)
    return dispatchResponse.statusCode === 204
  }
}
