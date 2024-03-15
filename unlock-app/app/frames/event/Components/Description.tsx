import React from 'react'
import Container from './Container'
import { FrameButton, FrameImage } from 'frames.js/next/server'
import { registerButton } from '../utils'

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
      <FrameButton>Back</FrameButton>
      {registerButton(event)}
    </Container>
  )
}

export default Description
