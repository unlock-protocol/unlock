/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { locksmith } from '../../../src/config/locksmith'
import { frames } from './frames'
import { defaultFrame } from './components/defaultFrame'

const handler = frames(async (ctx) => {
  const id = ctx.searchParams.id
  const state = ctx.state

  const { config } = await fetch(
    `https://locksmith.unlock-protocol.com/v2/checkout/${id}`
  ).then((res) => res.json())

  const locks = config.locks
  const lockAddress = Object.keys(locks)[0]
  const { name, network } = locks[lockAddress]

  const { data } = await locksmith.lockMetadata(network, lockAddress)
  const { image, description } = data

  const lock = { name, address: lockAddress, network, image, description }
  state.lock = lock

  return defaultFrame({ name, description, image, state })
})

const postHandler = frames(async (ctx) => {
  const state = ctx.state
  const { image, name, description } = ctx.state.lock!
  const success = ctx.searchParams.success

  if (success === 'true') {
    return {
      image: image,
      buttons: [
        <Button action="link" target="https://app.unlock-protocol.com/keychain">
          Success! View on keychain
        </Button>,
        <Button action="tx" target="/txdata" post_url="?success=true">
          Buy again
        </Button>,
      ],
      state,
    }
  }

  return defaultFrame({ name, description, image, state })
})

export const GET = handler
export const POST = postHandler
