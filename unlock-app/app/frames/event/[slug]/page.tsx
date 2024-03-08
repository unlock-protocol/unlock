import { storage } from '../../../../src/config/storage'
import { toFormData } from '../../../../src/components/interface/locks/metadata/utils'
import dayjs from '../../../../src/utils/dayjs'

import {
  FrameContainer,
  FrameImage,
  FrameButton,
  useFramesReducer,
  getPreviousFrame,
  validateActionSignature,
  FrameInput,
} from 'frames.js/next/server'
import { config } from '../../../../src/config/app'
import { DefaultImage } from '../Components/DefaultImage'

const reducer = (state, action) => {
  console.log('action')
  console.log(action)
  console.log('state')
  console.log(state)
  return { ...state }
}

interface SearchParams {
  [key: string]: string | string[] | undefined
}

interface HomeProps {
  params: { slug: string }
  searchParams: SearchParams
}

export default async function Frame(props: HomeProps) {
  const slug = props.params.slug
  const previousFrame = getPreviousFrame(props.searchParams)
  // await validateActionSignature(previousFrame.postBody)
  const [state, dispatch] = useFramesReducer(
    reducer,
    { view: 'default' },
    previousFrame
  )

  const { data: eventMetadata } = await storage
    .getEvent(slug)
    .catch((error) => {
      console.error(error)
      return { data: null }
    })
  if (!eventMetadata?.data) {
    return new Response('Event not found', { status: 404 })
  }

  const { ticket: event, image } = toFormData(eventMetadata.data)

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
