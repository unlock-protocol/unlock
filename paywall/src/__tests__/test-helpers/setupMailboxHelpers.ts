import FakeWindow from './fakeWindowHelpers'
import { IframePostOfficeWindow } from '../../windowTypes'
import {
  SetTimeoutWindow,
  FetchWindow,
  ConstantsType,
} from '../../data-iframe/blockchainHandler/blockChainTypes'
import { PaywallConfig } from '../../unlockTypes'
import { addresses } from './setupBlockchainHelpers'

export interface MailboxTestDefaults {
  fakeWindow: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  constants: ConstantsType
  configuration: PaywallConfig
}

export type PartialMailboxTestDefaults = Partial<MailboxTestDefaults>
export function setupTestDefaults() {
  const result: PartialMailboxTestDefaults = {}
  result.fakeWindow = new FakeWindow()
  result.constants = {
    requiredConfirmations: 12,
    locksmithHost: 'http://fun.times',
    unlockAddress: '0x123',
    blockTime: 5000,
    readOnlyProvider: 'http://readonly',
    defaultNetwork: 1984,
  }

  result.configuration = {
    locks: {
      // addresses are not normalized yet
      [addresses[0]]: { name: '1' },
      [addresses[1]]: { name: '2' },
      [addresses[2]]: { name: '3' },
    },
    callToAction: {
      default: '',
      expired: '',
      pending: '',
      confirmed: '',
    },
  }
  return result as MailboxTestDefaults
}

export default setupTestDefaults
