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
  const removeMd = require('remove-markdown')

  function truncateString(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text
    }

    const shortenedString = text.substring(0, maxLength)
    const lastSpaceIndex = shortenedString.lastIndexOf(' ')

    if (lastSpaceIndex !== -1) {
      return shortenedString.substring(0, lastSpaceIndex) + '...'
    } else {
      return shortenedString + '...'
    }
  }

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
