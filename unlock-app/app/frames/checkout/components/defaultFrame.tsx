/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { DefaultImage } from './DefaultImage'

export function getDefaultFrame(ctx: any) {
  const lock = ctx.state.lock!
  const isErc20 = !!ctx.state.lock?.tokenAddress
  const approved = ctx.searchParams.approved || !isErc20
  const buttonText = approved
    ? 'Purchase a key'
    : `Approve ${lock.currencySymbol} spending`

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
      <Button
        action="tx"
        target={approved ? '/txdata' : '/approve'}
        post_url={approved ? '?success=true' : '?approved=true'}
      >
        {buttonText}
      </Button>,
    ],
    state: ctx.state,
  }
}
