/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { frames } from './frames'
import { getDefaultFrame } from './components/defaultFrame'
import { Success } from './components/Success'
import { getLockDataFromCheckout } from './components/utils'

const getInitialFrame = frames(async (ctx) => {
  const id = ctx.searchParams.id
  const state = ctx.state

  const lock = await getLockDataFromCheckout(id)
  state.lock = lock

  return getDefaultFrame(state)
})

const getOtherFrames = frames(async (ctx) => {
  const state = ctx.state
  const lock = state.lock!
  const success = ctx.searchParams.success

  if (success === 'true') {
    return {
      image: <Success lock={lock} />,
      buttons: [
        <Button action="link" target="https://app.unlock-protocol.com/keychain">
          View on keychain
        </Button>,
        <Button action="tx" target="/txdata" post_url="?success=true">
          Buy again
        </Button>,
      ],
      state,
    }
  }

  return getDefaultFrame(state)
})

export const GET = getInitialFrame
export const POST = getOtherFrames
