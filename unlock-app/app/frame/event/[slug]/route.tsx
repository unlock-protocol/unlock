import { getFrameHtmlResponse, FrameRequest } from '@coinbase/onchainkit/frame'
import { NextRequest, NextResponse } from 'next/server'
import { config } from '~/config/app'

export const getFrame = async (slug: string) => {
  return {
    buttons: [
      {
        action: 'link',
        label: 'Register',
        target: `${config.unlockApp}/event/${slug}`,
      },
      {
        label: 'Show location',
      },
      {
        label: 'See description',
      },
    ],
    image: {
      src: `${config.unlockApp}/og/event/${slug}`,
      // aspectRatio: '1:1',
    },
    // input={{
    //   text: 'Tell me a boat story',
    // }}
    // state={{
    //   counter: 1,
    // }}
    postUrl: `${config.unlockApp}/frame/event/${slug}`,
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  const frameRequest: FrameRequest = await req.json()
  console.log(params, frameRequest)
  // const { isValid, message } = await getFrameMessage(frameRequest)
  // console.log({ isValid, message })

  // Step 2. Build your Frame logic
  // ...

  return new NextResponse(
    // Step 3. Use getFrameHtmlResponse to create a Frame response
    getFrameHtmlResponse(getFrame(params.slug))
  )
}
