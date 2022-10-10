import { SiweMessage } from 'siwe'
import { DefaultApi, Configuration } from '../@generated/client'

export class LocksmithClient extends DefaultApi {
  /**
   * Helper static createSiweMessage method wrapping SIWE or sign in with ethereum standard message
   */
  static createSiweMessage(options: Partial<SiweMessage>) {
    return new SiweMessage(options)
  }
}

export const LocksmithClientConfiguration = Configuration
