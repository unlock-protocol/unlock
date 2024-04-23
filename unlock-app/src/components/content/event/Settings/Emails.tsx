import { Event, PaywallConfigType } from '@unlock-protocol/core'

import { SettingCard } from '~/components/interface/locks/Settings/elements/SettingCard'
import SendCustomEmail from './Components/CustomEmail'
import { SenderSettings } from './Components/SenderSettings'

export interface EmailsProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const Emails = ({ event, checkoutConfig }: EmailsProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Sender information"
        description="Set a sender as well as as a reply-to email address."
      >
        <SenderSettings event={event} checkoutConfig={checkoutConfig} />
      </SettingCard>

      {/* <SettingCard
        label="Send invites"
        description="Enter the email addresses to invite attendees to your event. They will get an email inviting them to RSVP for your event!"
      >
        Here, we show an input form where a lock manager can enter email
        addresses. We should keep track of invites sent!
      </SettingCard> */}

      <SettingCard
        label="Email attendees"
        description="Send an email to all the confirmed attendees of your event. "
      >
        <SendCustomEmail event={event} checkoutConfig={checkoutConfig} />
      </SettingCard>
    </div>
  )
}
