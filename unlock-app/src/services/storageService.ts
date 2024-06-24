import {
  LocksmithService,
  LocksmithServiceConfiguration,
} from '@unlock-protocol/unlock-js'
import { EventEmitter } from 'events'

// Will be deprecated with NextAuth
export class StorageService extends EventEmitter {
  public host: string

  public locksmith: LocksmithService

  constructor(host: string) {
    super()
    this.host = host
    this.locksmith = new LocksmithService(
      new LocksmithServiceConfiguration({
        basePath: host,
      })
    )
  }

  genAuthorizationHeader(token: string) {
    return { Authorization: ` Bearer ${token}` }
  }
}
