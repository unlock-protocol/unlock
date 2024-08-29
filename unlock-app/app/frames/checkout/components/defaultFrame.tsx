/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'

interface DefaultFrameProps {
  name: string
  description: string
  image: string
  state: any
}

export function defaultFrame({
  name,
  description,
  image,
  state,
}: DefaultFrameProps) {
  return {
    image: (
      <div tw="flex w-full h-full bg-gray-200 p-2">
        <img src={image} tw="w-1/2 h-full border-4 border-white rounded-lg" />
        <div tw="flex flex-col justify-center ml-4">
          <p tw="text-6xl">{name}</p>
          <p>{description}</p>
        </div>
      </div>
    ),
    imageOptions: {
      dynamic: true,
      headers: {
        // make sure this is always equal or great than minimumCacheTTL when using Next.js Image component
        // @see https://nextjs.org/docs/app/api-reference/components/image#minimumcachettl
        'Cache-Control': 'max-age=1',
      },
    },
    buttons: [
      <Button action="tx" target="/txdata" post_url="?success=true">
        Purchase a key
      </Button>,
    ],
    state,
  }
}
