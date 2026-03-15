import { ImageResponse } from '@vercel/og'
import React from 'react'
import { locksmith } from '../../../../src/config/locksmith'
import { DefaultImage } from '../../../frames/event/Components/DefaultImage'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Loading fonts from static assets
  const inter400 = await fetch(
    new URL('/fonts/inter-400.woff', request.url)
  ).then((res) => res.arrayBuffer())
  const inter700 = await fetch(
    new URL('/fonts/inter-700.woff', request.url)
  ).then((res) => res.arrayBuffer())

  const { data: eventMetadata } = await locksmith
    .getEvent(slug)
    .catch((error) => {
      console.error(error)
      return { data: null }
    })
  if (!eventMetadata?.data) {
    return new Response('Event not found', { status: 404 })
  }

  return new ImageResponse(<DefaultImage event={eventMetadata} />, {
    width: 1146,
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
  })
}
