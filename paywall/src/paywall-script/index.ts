import { Paywall } from './Paywall'

const rawConfig = (window as any).unlockProtocolConfig
if (!rawConfig) {
  console.error('Missing window.unlockProtocolConfig.')
} else {
  new Paywall(rawConfig)
}
