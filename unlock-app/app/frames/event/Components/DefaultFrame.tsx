import React from 'react'
import Container from './Container'
import { FrameButton, FrameImage } from 'frames.js/next/server'
import { config } from '../../../../src/config/app'
import { DefaultImage } from './DefaultImage'
import { Event } from '@unlock-protocol/core'

export const DefaultFrame = ({
  previousFrame,
  state,
  event,
  dispatch,
}: {
  previousFrame: any
  state: any
  event: Event
  dispatch: any
}) => {
  return (
    <Container slug={event.slug} previousFrame={previousFrame} state={state}>
      <FrameImage>
        <DefaultImage event={event} />
      </FrameImage>
      <FrameButton
        action="link"
        target={`${config.unlockApp}/event/${event.slug}`}
      >
        Register
      </FrameButton>
      {/* <FrameButton target={`${config.unlockApp}/frames/event?hahahahah!`}> */}
      {/* @ts-expect-error Type '{ children: string; onClick: any; }' is not assignable to type 'IntrinsicAttributes & FrameButtonProvidedProps'. */}
      <FrameButton onclick={dispatch}>See description</FrameButton>
    </Container>
  )
}
