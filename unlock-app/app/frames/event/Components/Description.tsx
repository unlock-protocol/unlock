import React from 'react'
import Container from './Container'
import { FrameButton, FrameImage } from 'frames.js/next/server'
import { config } from '../../../../src/config/app'
import removeMd from 'remove-markdown'
import { truncateString } from '~/utils/truncateString'

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
        <div tw="flex bg-[#F5F5F5] h-full">
          <p tw="px-8 h-full w-full">
            {truncateString(
              removeMd(event.data.description, { useImgAltText: false }),
              650
            )}
          </p>
        </div>
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
