import React from 'react'
import Container from './Container'
import { FrameButton, FrameImage } from 'frames.js/next/server'
import { config } from '../../../../src/config/app'
import { registerButton } from '../utils'

export const DefaultFrame = ({
  previousFrame,
  state,
  event,
}: {
  previousFrame: any
  state: any
  event: any
}) => {
  return (
    <Container slug={event.slug} previousFrame={previousFrame} state={state}>
      <FrameImage src={`${config.unlockApp}/og/event/${event.slug}`} />
      <FrameButton>See description</FrameButton>
      {registerButton(event)}
    </Container>
  )
}

export default DefaultFrame
