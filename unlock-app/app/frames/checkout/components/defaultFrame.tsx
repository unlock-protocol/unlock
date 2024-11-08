/* eslint-disable react/jsx-key */
import React from 'react'
import { Button } from 'frames.js/next'
import { getAddressForFid } from 'frames.js'
import { DefaultImage } from './DefaultImage'
import { isMember as checkIsMember, getKeyPrice, checkAllowance } from './utils'

export async function getDefaultFrame(ctx: any) {
  const lock = ctx.state.lock!
  const isErc20 = !!ctx.state.lock?.tokenAddress
  const approved = ctx.searchParams.approved || lock.erc20Approved || !isErc20
  let userAddress: string
  const buttonText = approved
    ? 'Mint'
    : `Approve ${lock.currencySymbol} spending`

  const fid = ctx.message?.requesterFid
  if (fid && !lock.priceForUser) {
    userAddress = await getAddressForFid({
      fid,
      options: { fallbackToCustodyAddress: true },
    })

    const { address: lockAddress, network, tokenAddress } = lock

    const isMember = await checkIsMember(lockAddress, network, userAddress)
    lock.isMember = isMember

    const keyPrice = await getKeyPrice({
      lockAddress,
      network,
      userAddress,
    })
    lock.priceForUser = keyPrice

    if (tokenAddress) {
      const allowance = await checkAllowance(
        lockAddress,
        Number(network),
        userAddress as string,
        tokenAddress!
      )
      if (Number(allowance) >= Number(keyPrice)) {
        lock.erc20Approved = true
      }
    }
  }

  const buttons =
    !lock.isSoldOut && !lock.isMember
      ? [
          fid ? (
            <Button
              action="tx"
              target={approved ? '/txdata' : '/approve'}
              post_url={approved ? '?success=true' : '?approved=true'}
            >
              {buttonText}
            </Button>
          ) : (
            <Button action="post" target="/">
              Continue
            </Button>
          ),
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
