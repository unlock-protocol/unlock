import React from 'react'
import Container from './Container'
import { FrameButton, FrameImage } from 'frames.js/next/server'
import { config } from '../../../../src/config/app'

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
      <FrameButton
        action="link"
        target={`${config.unlockApp}/event/${event.slug}`}
      >
        Register
      </FrameButton>
      {/* <FrameButton target={`${config.unlockApp}/frames/event?hahahahah!`}> */}
      <FrameButton>See description</FrameButton>
    </Container>
  )
}
