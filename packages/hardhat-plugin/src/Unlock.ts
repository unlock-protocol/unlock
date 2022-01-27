/* eslint-disable class-methods-use-this */

import networks from '@unlock-protocol/networks'
import { NetworkConfigs } from '@unlock-protocol/types'

export class UnlockHRE {
  public networks: NetworkConfigs = networks

  public deployLock() {
    console.log('lets deploy')
    return 'hello'
  }
}
