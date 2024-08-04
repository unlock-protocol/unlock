import { locksmith } from '../../../src/config/locksmith'
import { frames } from './frames'
import { Button } from 'frames.js/next'
import React from 'react'

const handler = frames(async (ctx) => {
  const id = ctx.searchParams.id
  const state = ctx.state

  async function getInitialFrame() {
    const config = await fetch(
      `https://locksmith.unlock-protocol.com/v2/checkout/${id}`
    ).then((res) => res.json())

    const locks = config.config.locks
    const lockAddress = Object.keys(locks)[0]
    const { name, network } = locks[lockAddress]

    const { data } = await locksmith.lockMetadata(network, lockAddress)
    const { image, description } = data

    //TODO: get price

    const lock = { name, address: lockAddress, network, image }
    state.lock = lock

    return {
      image: image,
      buttons: [
        <Button
          key="i"
          action="post"
          target={{ pathname: `/frames/checkout`, query: { step: 'purchase' } }}
        >
          To purchase page
        </Button>,
      ],
      state,
    }
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
