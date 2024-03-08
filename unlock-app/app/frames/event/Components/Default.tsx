import React from 'react'

interface Props {
  name: string
  startTime?: string
  location?: string
  iconURL?: string
  bannerURL?: string
}

export const Default = ({
  name,
  startTime,
  location,
  iconURL,
  bannerURL,
}: Props) => {
  return (
    <FrameContainer
      pathname={`${config.unlockApp}/frames/event/${slug}`}
      postUrl={`${config.unlockApp}/frames/event`}
      state={{}}
      previousFrame={previousFrame}
    >
      <FrameImage>
        <DefaultImage
          // @ts-expect-error Property 'name' does not exist on type 'GetEvent200Response'.
          name={eventMetadata.name}
          startTime={dayjs
            .tz(event.event_start_date, event.event_timezone)
            .toDate()
            .toDateString()}
          location={event?.event_address}
          bannerURL={event.event_cover_image}
          iconURL={image}
        />
      </FrameImage>
      <FrameButton action="link" target={`${config.unlockApp}/event/${slug}`}>
        Register
      </FrameButton>
      <FrameButton onClick={dispatch}>See Description</FrameButton>
    </FrameContainer>
  )
}
