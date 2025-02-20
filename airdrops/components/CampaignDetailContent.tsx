'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Container } from './layout/Container'
import { Button, Checkbox } from '@unlock-protocol/ui'
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

      {/* Full-width title and description */}
      <div className="max-w-6xl space-y-4 mb-8">
        <h1 className="text-4xl font-bold">{campaign.title}</h1>
        <p className="text-xl text-gray-600">{campaign.description}</p>
      </div>

      {/* Two-column layout for remaining content */}
      <div className="grid max-w-6xl grid-cols-1 gap-8 pb-12 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
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

              <Checkbox
                label="I have read and agree to the Terms of Service"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
              />

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
