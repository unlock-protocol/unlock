import React from 'react'
import { FrameButton } from 'frames.js/next/server'
import { config } from '../../../src/config/app'
import {
  getEventDate,
  getEventEndDate,
} from '../../../src/components/content/event/utils'
import dayjs from '../../../src/utils/dayjs'

export const registerButton = (event: any) => {
  const eventDate = getEventDate(event.ticket) // Full date + time of event
  const eventEndDate = getEventEndDate(event.ticket)
  const hasPassed = eventEndDate
    ? dayjs().isAfter(eventEndDate)
    : dayjs().isAfter(eventDate)

  console.log('OK???')
  if (false && hasPassed) {
    // No button
    return null
  }

  const singleLock = Object.keys(event.checkoutConfig.config.locks).length === 1

  if (singleLock && event.data.requiresApproval) {
    return <FrameButton>Apply</FrameButton>
  }
  return (
    <FrameButton
      action="link"
      target={`${config.unlockApp}/event/${event.slug}`}
    >
      Register
    </FrameButton>
  )
}
