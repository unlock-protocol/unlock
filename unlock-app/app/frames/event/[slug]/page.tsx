// ./app/page.tsx

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

export default async function Home(props: HomeProps) {
  const slug = props.params.slug
  const previousFrame = getPreviousFrame(props.searchParams)
  // await validateActionSignature(previousFrame.postBody)
  const [state, dispatch] = useFramesReducer(
    reducer,
    { count: 0 },
    previousFrame
  )

  return (
    <FrameContainer
      pathname={`${config.unlockApp}/frames/event/${slug}`}
      postUrl={`${config.unlockApp}/frames/event`}
      state={{}}
      previousFrame={previousFrame}
    >
      <FrameImage src={`${config.unlockApp}/og/event/${slug}`} />
      <FrameButton action="link" target={`${config.unlockApp}/event/${slug}`}>
        Register
      </FrameButton>
      <FrameButton onClick={dispatch}>Show Location</FrameButton>
      <FrameButton onClick={dispatch}>See Description</FrameButton>
    </FrameContainer>
  )
}
