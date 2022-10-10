import { SiweMessage } from 'siwe'
import { DefaultApi } from './@generated/client'

export class LocksmithService extends DefaultApi {
  /**
   * Helper static createSiweMessage method wrapping SIWE or sign in with ethereum standard message
   */
  static createSiweMessage(options: Partial<SiweMessage>) {
    return new SiweMessage(options)
  }
}

export { Configuration as LocksmithServiceConfiguration } from './@generated/client'
