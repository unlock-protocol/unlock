/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { locksmith } from '../../../src/config/locksmith'
import { frames } from './frames'
import { defaultFrame } from './components/defaultFrame'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

const getHandler = frames(async (ctx) => {
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

  //svg images are not rendered
  const isSvg = /\/icon\/?$/.test(image)
  const defaultImage = isSvg ?
    <div tw="flex-1 h-full flex justify-center items-center border-4 border-white rounded-lg bg-gray-300"><p>{name} image</p></div>
    : <img src={image} tw="flex-1 min-h-full border-4 border-white rounded-lg" />

  const web3Service = new Web3Service(networks)
  const res = await web3Service.getLock(lockAddress, network)
  const price = `${res.keyPrice} ${res.currencySymbol}`

  const lock = {
    name,
    address: lockAddress,
    network,
    image,
    defaultImage,
    description,
    price,
  }
  state.lock = lock

  return defaultFrame(state)
})

const postHandler = frames(async (ctx) => {
  const state = ctx.state
  const success = ctx.searchParams.success

  if (success === 'true') {
    return {
      image: defaultFrame(state),
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

  return defaultFrame(state)
})

export const GET = getHandler
export const POST = postHandler
