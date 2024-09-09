/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { State } from '../frames'
import { DefaultImage } from './DefaultImage'

export function getDefaultFrame(state: State) {
  const lock = state.lock!

  return {
    image: <DefaultImage lock={lock} />,
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
