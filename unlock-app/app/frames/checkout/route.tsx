/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { frames } from './frames'
import { getDefaultFrame } from './components/defaultFrame'
import { TransactionSuccess } from './components/TransactionSuccess'
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
    const keychainButton = (
      <Button action="link" target="https://app.unlock-protocol.com/keychain">
        View on keychain
      </Button>
    )
    const redirectText = lock.redirectText
      ? lock.redirectText
      : lock.redirectUri
    const buttons = lock.redirectUri
      ? [
          keychainButton,
          <Button action="link" target={lock.redirectUri!}>
            {redirectText!}
          </Button>,
        ]
      : [keychainButton]

    return {
      image: <TransactionSuccess lock={lock} />,
      buttons,
      state,
    }
  }

  return getDefaultFrame(state)
})

export const GET = getInitialFrame
export const POST = getOtherFrames
