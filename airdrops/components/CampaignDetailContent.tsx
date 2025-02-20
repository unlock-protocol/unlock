'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Container } from './layout/Container'
import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import Link from 'next/link'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { ConnectButton } from './auth/ConnectButton'

interface CampaignDetailContentProps {
  campaign: {
    title: string
    description: string
    contractAddress: string
    tokenAmount: string
    tokenSymbol: string
  }
}

export default function CampaignDetailContent({
  campaign,
}: CampaignDetailContentProps) {
  const { authenticated } = usePrivy()
  const [tosAccepted, setTosAccepted] = useState(false)

  return (
    <Container>
      <Button variant="borderless" aria-label="arrow back" className="my-5">
        <Link href="/">
          <ArrowBackIcon size={20} className="cursor-pointer" />
        </Link>
      </Button>

      <div className="grid max-w-6xl grid-cols-1 gap-8 pt-5 pb-12 md:grid-cols-2">
        {/* Left Column - Campaign Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{campaign.title}</h1>
            <p className="text-xl text-gray-600">{campaign.description}</p>
          </div>

          <div className="p-6 border rounded-xl space-y-4 bg-gray-50">
            <h2 className="text-2xl font-semibold">Your Rewards</h2>
            <div className="space-y-2">
              <p className="text-lg">
                <span className="font-medium">{campaign.tokenAmount}</span>{' '}
                <span className="text-gray-600">{campaign.tokenSymbol}</span>
              </p>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-3">Terms of Service</h3>
            <p className="text-sm text-gray-600">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Earum
              excepturi id explicabo, ad iste, autem placeat expedita aliquid,
              commodi qui nam fuga asperiores ab fugit ducimus ipsam. Libero,
              pariatur. Possimus?
            </p>
          </div>
        </div>

        {/* Right Column - Claim Section */}
        <div className="p-6 border rounded-xl space-y-6">
          <h2 className="text-2xl font-semibold">Claim Your Rewards</h2>

          {authenticated ? (
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-2">Status</h3>
                <p className="text-green-600 font-medium">Eligible for Claim</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={tosAccepted}
                  onChange={(e) =>
                    setTosAccepted((e.target as HTMLInputElement).checked)
                  }
                />
                <span className="text-sm text-gray-600">
                  I have read and agree to the Terms of Service
                </span>
              </label>

              <Button
                disabled={!tosAccepted}
                onClick={() => {
                  console.log('Claiming tokens for', campaign.contractAddress)
                }}
              >
                Claim Tokens
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Please connect your wallet to claim this airdrop.
              </p>
              <ConnectButton />
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
