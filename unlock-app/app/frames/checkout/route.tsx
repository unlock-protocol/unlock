import { ImageResponse } from '@vercel/og'
import { locksmith } from '../../../src/config/locksmith'
import { frames } from './frames'
import { Button } from 'frames.js/next'
import { FrameButton, FrameImage, FrameContainer, FrameInput, getPreviousFrame} from "frames.js/next/server"
import React from 'react'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'

const myadd = '0xA331802a9668CD744e603B8Cd901fa96c1800bB2'

const handler = frames(async (ctx) => {
  const id = ctx.searchParams.id
  const state = ctx.state
  const add = ctx.message?.connectedAddress
  console.log('\nadd=', add, myadd)

  async function getInitialFrame() {
    const config = await fetch(
      `https://locksmith.unlock-protocol.com/v2/checkout/${id}`
    ).then((res) => res.json())

    const locks = config.config.locks
    const lockAddress = Object.keys(locks)[0]
    const { name, network } = locks[lockAddress]

    const { data } = await locksmith.lockMetadata(network, lockAddress)
    const { image, description } = data

    const img = <div>hey</div>

    const web3Service = new Web3Service(networks)
    const mydata = '0x'
    // let keyPrice = await web3Service.purchasePriceFor({
    //   lockAddress,
    //   userAddress: myadd,
    //   network,
    //   data: mydata,
    //   referrer: myadd,
    // })
    // keyPrice = keyPrice.toString()
    // console.log('price=', keyPrice, Number(keyPrice))
  

    const lock = { name, address: lockAddress, network, image }
    state.lock = lock


    return {
      image: <p>hey</p>,
      imageOptions: {
        dynamic: true,
        headers: {
          // make sure this is always equal or great than minimumCacheTTL when using Next.js Image component
          // @see https://nextjs.org/docs/app/api-reference/components/image#minimumcachettl
          "Cache-Control": "max-age=1",
        },
      },
      buttons: [
        <Button
          key="i"
          action="post"
          target={{ pathname: `/frames/checkout`, query: { step: 'purchase' } }}
        >
          {name}
        </Button>,
      ],
      state,
    }
    // const previousFrame = getPreviousFrame(ctx.searchParams)


    // return <FrameContainer
    //     postUrl="/frames"
    //     state={state}
    //     previousFrame={previousFrame}
    //   >
    //     <FrameImage>
    //     <div tw="flex bg-[#F5F5F5] h-full">
    //       <p tw="px-8 h-full w-full">
    //         this is an img
    //       </p>
    //     </div>
    //     </FrameImage>
    //     <FrameInput text="put some text here" />
    //   </FrameContainer>
  }

  return getInitialFrame()
})

const postHandler = frames(async (ctx) => {
  const state = ctx.state
  const image = ctx.state.lock!.image
  const address = ctx.state.lock!.address
  const step = ctx.searchParams.step

  switch (step) {
    case 'purchase':
      return {
        image: image,
        buttons: [
          <Button
            key="i"
            action="tx"
            target="/frames/checkout/txdata"
            post_url="/frames/checkout"
          >
            mint a key
          </Button>,
        ],
      }

    default:
      return {
        image: image,
        buttons: [
          <Button
            key="i"
            action="post"
            target={{
              pathname: `/frames/checkout`,
              query: { step: 'purchase' },
            }}
          >
            purchase
          </Button>,
          <Button key="j" action="post">
            ERROR?
          </Button>,
        ],
        state,
      }
  }
})

export const GET = handler
export const POST = postHandler
