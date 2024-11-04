/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { DefaultImage } from './DefaultImage'

export function getDefaultFrame(ctx: any) {
  const lock = ctx.state.lock!
  const isErc20 = !!ctx.state.lock?.tokenAddress
  const approved = ctx.searchParams.approved || lock.erc20Approved || !isErc20
  const userAddress = ctx.message?.address
  const buttonText = !userAddress
    ? 'Continue with wallet'
    : approved
      ? 'Mint'
      : `Approve ${lock.currencySymbol} spending`
  const buttons =
    !lock.isSoldOut && !lock.isMember
      ? [
          <Button
            action="tx"
            target={
              !userAddress ? '/sign_message' : approved ? '/txdata' : '/approve'
            }
            post_url={
              !userAddress ? '/' : approved ? '?success=true' : '?approved=true'
            }
          >
            {buttonText}
          </Button>,
        ]
      : []

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
    buttons,
    state: ctx.state,
  }
}
