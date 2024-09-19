'use client'

import { Event, PaywallConfigType } from '@unlock-protocol/core'
import Link from 'next/link'
import { SettingCard } from '~/components/interface/locks/Settings/elements/SettingCard'
import { VerifierForm } from '~/components/interface/locks/Settings/forms/VerifierForm'
import { StakeRefund } from './StakeRefund'

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
        description="Add verifiers who can scan QR codes and verify tickets at the door!"
      >
        <VerifierForm event={event} checkoutConfig={checkoutConfig} />
      </SettingCard>

      <SettingCard
        label="TokenProof"
        description="You can optionaly choose to use TokenProof to verify tickets!"
      >
        <p>
          Please follow the steps{' '}
          <Link
            target="_blank"
            className="text-brand-ui-primary hover:underline"
            href="https://unlock-protocol.com/guides/tokenproof/"
          >
            in this guide
          </Link>
          .
        </p>
      </SettingCard>

      <SettingCard
        label="Refund attendees"
        description="With Events  by Unlock, you can choose to refund attendees when they actually show up!"
      >
        <StakeRefund event={event} checkoutConfig={checkoutConfig} />
      </SettingCard>
    </div>
  )
}
