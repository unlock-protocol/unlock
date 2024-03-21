import React from 'react'
import Container from './Container'
import { FrameButton, FrameImage } from 'frames.js/next/server'
import { config } from '../../../../src/config/app'

export const Description = ({
  event,
  previousFrame,
  state,
}: {
  event: any
  previousFrame: any
  state: any
}) => {
  return (
    <Container slug={event.slug} previousFrame={previousFrame} state={state}>
      <FrameImage>
        <p tw="px-4">{event.data.description}</p>
      </FrameImage>
      <FrameButton
        action="link"
        target={`${config.unlockApp}/event/${event.slug}`}
      >
        Register
      </FrameButton>
      <FrameButton target={`${config.unlockApp}/frames/event`}>
        Back
      </FrameButton>
    </Container>
  )
}
