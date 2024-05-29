import { PaywallConfigType } from '@unlock-protocol/core'

interface SettingsProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const Settings = ({ checkoutConfig, event }: SettingsProps) => {
  console.log(checkoutConfig, event)
  return <p>Coming soon</p>
}
