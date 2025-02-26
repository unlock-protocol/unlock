'use client'
import { ethers } from 'ethers'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Container } from './layout/Container'
import { Button, Checkbox } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { ConnectButton } from './auth/ConnectButton'
import { isEligible } from '../src/utils/eligibility'
import { AirdropData } from './Campaigns'

interface CampaignDetailContentProps {
  airdrop: AirdropData
}

const timestamp = new Date().getTime()

export default function CampaignDetailContent({
  airdrop,
}: CampaignDetailContentProps) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [termsOfServiceSignature, setTermsOfServiceSignature] = useState('')

  useEffect(() => {
    const run = async () => {
      const amount = await isEligible(
        wallets[0].address,
        airdrop.recipientsFile
      )
      airdrop.eligible = amount || 0
    }
    run()
  }, [authenticated, wallets, airdrop])

  const onBoxChecked = async () => {
    if (!termsOfServiceSignature) {
      const provider = await wallets[0].getEthereumProvider()
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()

      await wallets[0].switchChain(8453)

      const domain = {
        name: 'Airdrops', // await airdrops.EIP712Name(),
        version: '1', // await airdrops.EIP712Version(),
        chainId: 8453,
        verifyingContract: '0x4200000000000000000000000000000000000011', // replace me
      }

      const types = {
        TosSignature: [
          { name: 'signer', type: 'address' },
          { name: 'campaignName', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
        ],
      }

      const value = {
        signer: signer.address,
        campaignName: airdrop.title,
        timestamp,
      }

      const signature = await signer.signTypedData(domain, types, value)
      setTermsOfServiceSignature(signature)
    } else {
      setTermsOfServiceSignature('')
    }
  }

  return (
    <Container>
      <Button variant="borderless" aria-label="arrow back" className="my-5">
        <Link href="/">
          <ArrowBackIcon size={20} className="cursor-pointer" />
        </Link>
      </Button>

      {/* Full-width title and description */}
      <div className="max-w-6xl space-y-4 mb-8">
        <h1 className="text-4xl font-bold">{airdrop.title}</h1>
        <p className="text-xl text-gray-600">{airdrop.description}</p>
      </div>

      {/* Two-column layout for remaining content */}
      <div className="grid max-w-6xl grid-cols-1 gap-8 pb-12 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Terms of Service</h2>
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
                <p className="text-green-600 font-medium">
                  Eligible to Claim {airdrop.eligible} UP
                </p>
              </div>

              <Checkbox
                label="I have read and agree to the Terms of Service"
                checked={!!termsOfServiceSignature}
                onChange={onBoxChecked}
              />

              <Button
                disabled={!termsOfServiceSignature}
                onClick={() => {
                  console.log('Claiming tokens for', airdrop.contractAddress)
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
