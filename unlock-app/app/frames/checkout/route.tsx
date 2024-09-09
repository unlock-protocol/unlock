/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { locksmith } from '../../../src/config/locksmith'
import { frames } from './frames'
import { getDefaultFrame } from './components/defaultFrame'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { Success } from './components/Success'

const getInitialFrame = frames(async (ctx) => {
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

  const web3Service = new Web3Service(networks)
  const res = await web3Service.getLock(lockAddress, network)
  const price = `${res.keyPrice} ${res.currencySymbol}`

  const lock = {
    name,
    address: lockAddress,
    network,
    image,
    description,
    price,
  }
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
