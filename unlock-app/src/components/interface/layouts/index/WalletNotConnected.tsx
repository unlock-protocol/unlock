'use client'
import React from 'react'
import { useConnectModal } from '~/hooks/useConnectModal'
import { ImageBar } from '../../locks/Manage/elements/ImageBar'

export const WalletNotConnected = () => {
  const { openConnectModal } = useConnectModal()
  return (
    <ImageBar
      src="/images/illustrations/wallet-not-connected.svg"
      description={
        <>
          <span>
            Wallet is not connected yet.{' '}
            <button
              onClick={(event) => {
                event.preventDefault()
                openConnectModal()
              }}
              className="cursor-pointer text-brand-ui-primary"
            >
              Connect it now
            </button>
          </span>
        </>
      }
    />
  )
}
