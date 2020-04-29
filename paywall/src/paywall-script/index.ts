import { Paywall } from './Paywall'

declare let __ENVIRONMENT_VARIABLES__: any
const moduleConfig: any = __ENVIRONMENT_VARIABLES__

const rawConfig = (window as any).unlockProtocolConfig
if (!rawConfig) {
  console.error('Missing window.unlockProtocolConfig.')
} else {
  new Paywall(rawConfig, moduleConfig)
}
