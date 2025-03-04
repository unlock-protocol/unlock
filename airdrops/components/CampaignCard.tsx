import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { AirdropData } from './Campaigns'
import { ethers } from 'ethers'
import { useEligibility } from './hooks/useEligibility'
import { usePrivy } from '@privy-io/react-auth'

interface CampaignCardProps {
  airdrop: AirdropData
}

const CampaignCardInternal = ({ airdrop }: CampaignCardProps) => {
  const {
    data: { eligible, claimed },
  } = useEligibility(airdrop)
  const { authenticated } = usePrivy()

  const { name, description, token, contractAddress, url } = airdrop

  const eligibleFormatted = eligible
    ? ethers.formatUnits(eligible, token?.decimals)
    : 0

  return (
    <div className="space-y-4 md:min-w-96 block min-h-48 p-6 border min-w-[24rem] sm:min-w-[28rem] rounded-xl transition-all duration-200">
      <h3 className="text-xl font-medium">{name}</h3>
      <p className="text-gray-600 line-clamp-3">{description}</p>
      <div className="flex items-center justify-between">
        {authenticated && contractAddress && (
          <>
            {Number(eligibleFormatted) > 0 && !claimed && (
              <>
                <Button disabled={!eligible}>Claim Rewards</Button>
                <div className="text-sm font-medium text-green-600">
                  Eligible for ${Number(eligibleFormatted).toLocaleString()} UP
                </div>
              </>
            )}
            {Number(eligibleFormatted) > 0 && claimed && (
              <div className="text-sm font-medium text-gray-500">
                🥳 You have claimed your UP!
              </div>
            )}
            {Number(eligibleFormatted) === 0 && (
              <div className="text-sm font-medium text-gray-500">
                😔 You are not eligible
              </div>
            )}
          </>
        )}
        {url && (
          <Link
            className="text-brand-ui-primary underline"
            href={url}
            target="_blank"
          >
            More info
          </Link>
        )}
      </div>
    </div>
  )
}

export const CampaignCard = ({ airdrop }: CampaignCardProps) => {
  const { authenticated } = usePrivy()
  const {
    data: { eligible, claimed },
  } = useEligibility(airdrop)

  if (!eligible || !authenticated) {
    return <CampaignCardInternal airdrop={airdrop} />
  } else if (claimed) {
    return <CampaignCardInternal airdrop={airdrop} />
  } else {
    return (
      <Link
        href={`/campaigns/${airdrop.id}`}
        className="hover:border-brand-ui-primary"
      >
        <CampaignCardInternal airdrop={airdrop} />
      </Link>
    )
  }
}
