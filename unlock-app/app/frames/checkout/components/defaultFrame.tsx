/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { State } from '../frames'

export function defaultFrame(state: State) {
  const { name, description, defaultImage, price } = state.lock!

  return {
    image: (
      <div tw="flex w-full h-full bg-gray-200 p-2">
        {defaultImage}
        <div tw="flex-1 flex flex-col justify-center ml-4">
          <p tw="text-6xl">{name}</p>
          <p>{description}</p>
          <p>{price}</p>
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
