import { Event, PaywallConfigType } from '@unlock-protocol/core'

import { SettingCard } from '~/components/interface/locks/Settings/elements/SettingCard'
import { VerifierForm } from '~/components/interface/locks/Settings/forms/VerifierForm'

export interface VerifiersProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const Verifiers = ({ event, checkoutConfig }: VerifiersProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Verifiers"
        description="Set a sender as well as as a reply-to email address."
      >
        <VerifierForm event={event} checkoutConfig={checkoutConfig} />
      </SettingCard>

      <SettingCard
        label="TokenProof"
        description="You can optionnaly choose to use TokenProof to verify tickets!"
      >
        <p>Show video/guide here!</p>
      </SettingCard>
    </div>
  )
}
