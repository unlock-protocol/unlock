import React from 'react'
import { ImageResponse } from 'next/og'
import { DefaultImage } from '../../frames/checkout/components/DefaultImage'
import { getLockDataFromCheckout } from '../../frames/checkout/components/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const id = searchParams.get('id')
  const lock = await getLockDataFromCheckout(id!)

  return new ImageResponse(<DefaultImage lock={lock} />, {
    width: 1146,
    height: 600,
  })
}
