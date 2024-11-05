import { RequestHandler } from 'express'
import normalizer from '../../utils/normalizer'
import { getLockMetadata } from '../../operations/metadataOperations'
import { readFileSync } from 'fs'
import { Resvg } from '@resvg/resvg-js'

const inter400 = readFileSync('src/fonts/inter-400.woff')
const inter700 = readFileSync('src/fonts/inter-700.woff')
import satori from 'satori'
import { imageURLToDataURI, imageUrlToBase64 } from '../../utils/image'
import dayjs from '../../config/dayjs'
import logger from '../../logger'

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    tw?: string
  }
}

interface Props {
  name: string
  startTime?: string
  location?: string
  iconURL: string
  bannerURL: string
}

export const OGEvent = ({
  name,
  startTime,
  location,
  iconURL,
  bannerURL,
}: Props) => {
  return (
    <div tw="flex flex-col bg-[#F5F5F5] h-full w-full rounded-xl">
      {bannerURL && (
        <img
          src={bannerURL}
          tw="absolute top-0 object-cover"
          aria-label={name}
        />
      )}
      <div tw="relative flex flex-col w-full h-90">
        <img
          width="64"
          height="64"
          src={iconURL}
          tw="w-64 h-64 top-16 left-12 rounded-xl border-4 shadow-xl border-white"
          aria-label={name}
        />
      </div>
      <div tw="flex items-center justify-between w-full px-6">
        <h1 tw="text-5xl w-128 bg-white/50 p-2 rounded">{name}</h1>
        <div tw="flex flex-col">
          {startTime && (
            <div tw="flex items-center bg-white/50 rounded-2xl">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="63"
                  height="63"
                  rx="15.5"
                  fill="#FFFDFA"
                />
                <g clip-path="url(#clip0_403_6543)">
                  <path
                    d="M38.6665 19.9997H43.9998C44.3535 19.9997 44.6926 20.1402 44.9426 20.3902C45.1927 20.6402 45.3332 20.9794 45.3332 21.333V42.6663C45.3332 43.02 45.1927 43.3591 44.9426 43.6091C44.6926 43.8592 44.3535 43.9997 43.9998 43.9997H19.9998C19.6462 43.9997 19.3071 43.8592 19.057 43.6091C18.807 43.3591 18.6665 43.02 18.6665 42.6663V21.333C18.6665 20.9794 18.807 20.6402 19.057 20.3902C19.3071 20.1402 19.6462 19.9997 19.9998 19.9997H25.3332V17.333H27.9998V19.9997H35.9998V17.333H38.6665V19.9997ZM35.9998 22.6663H27.9998V25.333H25.3332V22.6663H21.3332V27.9997H42.6665V22.6663H38.6665V25.333H35.9998V22.6663ZM42.6665 30.6663H21.3332V41.333H42.6665V30.6663Z"
                    fill="#373A3E"
                  />
                </g>
                <rect
                  x="0.5"
                  y="0.5"
                  width="63"
                  height="63"
                  rx="15.5"
                  stroke="#E4E4E4"
                />
                <defs>
                  <clipPath id="clip0_403_6543">
                    <rect
                      width="32"
                      height="32"
                      fill="white"
                      transform="translate(16 16)"
                    />
                  </clipPath>
                </defs>
              </svg>
              <p tw="text-2xl ml-6t font-semibold w-96">{startTime}</p>
            </div>
          )}

          {location && (
            <div tw="flex items-center mt-6 bg-white/50 rounded-2xl">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="63"
                  height="63"
                  rx="15.5"
                  fill="#FFFDFA"
                />
                <g clip-path="url(#clip0_403_6549)">
                  <path
                    d="M32 43.8669L38.6 37.2669C39.9052 35.9616 40.794 34.2985 41.1541 32.4881C41.5141 30.6776 41.3292 28.801 40.6228 27.0956C39.9163 25.3902 38.7201 23.9326 37.1852 22.9071C35.6504 21.8816 33.8459 21.3342 32 21.3342C30.1541 21.3342 28.3496 21.8816 26.8148 22.9071C25.2799 23.9326 24.0837 25.3902 23.3772 27.0956C22.6708 28.801 22.4859 30.6776 22.8459 32.4881C23.206 34.2985 24.0948 35.9616 25.4 37.2669L32 43.8669ZM32 47.6376L23.5147 39.1522C21.8365 37.474 20.6936 35.3358 20.2306 33.008C19.7676 30.6803 20.0052 28.2675 20.9135 26.0748C21.8217 23.8821 23.3598 22.0079 25.3332 20.6893C27.3066 19.3708 29.6266 18.667 32 18.667C34.3734 18.667 36.6934 19.3708 38.6668 20.6893C40.6402 22.0079 42.1783 23.8821 43.0865 26.0748C43.9948 28.2675 44.2324 30.6803 43.7694 33.008C43.3064 35.3358 42.1636 37.474 40.4853 39.1522L32 47.6376V47.6376ZM30.6667 29.3336V25.3336H33.3333V29.3336H37.3333V32.0002H33.3333V36.0002H30.6667V32.0002H26.6667V29.3336H30.6667Z"
                    fill="#373A3E"
                  />
                </g>
                <rect
                  x="0.5"
                  y="0.5"
                  width="63"
                  height="63"
                  rx="15.5"
                  stroke="#E4E4E4"
                />
                <defs>
                  <clipPath id="clip0_403_6549">
                    <rect
                      width="32"
                      height="32"
                      fill="white"
                      transform="translate(16 16)"
                    />
                  </clipPath>
                </defs>
              </svg>
              <p tw="text-2xl ml-6t font-semibold w-96">{location}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// TODO: replaced by routes on unlock-app since we use Vercel for hosting but only once axos supports the Edge runtime!
export const eventOGHandler: RequestHandler = async (request, response) => {
  const lockAddress = normalizer.ethereumAddress(
    request.params.lockAddress?.toString() || ''
  )
  const network = Number(request.params.network?.toString())
  const metadata = await getLockMetadata({
    network,
    lockAddress,
  })

  const attributes = (metadata?.attributes || []).reduce(
    (acc: Record<string, string>, attribute: Record<string, string>) => {
      acc[attribute.trait_type] = attribute.value
      return acc
    },
    {} as Record<string, string>
  )

  const [bannerURL, iconURL] = await Promise.all([
    attributes?.event_cover_image &&
      imageURLToDataURI(attributes?.event_cover_image),
    imageUrlToBase64(metadata?.image, lockAddress),
  ])

  const eventBannerSVG = await satori(
    <OGEvent
      name={metadata?.name || 'Unlock Event'}
      startTime={dayjs
        .tz(attributes.event_start_date, attributes.event_time_zone)
        .toDate()
        .toDateString()}
      location={attributes?.event_address}
      bannerURL={bannerURL}
      iconURL={iconURL}
    />,
    {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: 'Inter',
          data: inter400,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Inter',
          data: inter700,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )

  try {
    // OG cannot be SVG
    const svg = new Resvg(eventBannerSVG)
    const pngData = svg.render()
    const pngBuffer = pngData.asPng()

    response.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': pngBuffer.length,
    })

    response.end(pngBuffer)
    return
  } catch (error) {
    logger.error('Could not generate OG image', error)
    response
      .status(500)
      .json({ message: 'We could not generate OG image', error })
    return
  }
}
