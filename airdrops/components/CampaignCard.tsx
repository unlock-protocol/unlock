import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { AirdropData } from './Campaigns'
import { ethers } from 'ethers'
import { useEligibility } from './hooks/useEligibility'

interface CampaignCardProps {
  airdrop: AirdropData
  authenticated: boolean
  eligible?: number
}

const CampaignCardInternal = ({
  eligible,
  airdrop: { name, description, token, contractAddress, url },
  authenticated,
}: CampaignCardProps) => {
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
            <Button disabled={!authenticated || !eligible}>
              {eligible > 0 ? 'Claim Rewards' : 'Not Eligible'}
            </Button>
            <div
              className={`text-sm font-medium ${
                eligible > 0 ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {eligible > 0
                ? `Eligible for ${Number(eligibleFormatted).toLocaleString()} UP`
                : ''}
            </div>
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

export const CampaignCard = ({ airdrop, authenticated }: CampaignCardProps) => {
  const { data: eligible } = useEligibility(airdrop)

  if (!eligible || !authenticated) {
    return (
      <CampaignCardInternal airdrop={airdrop} authenticated={authenticated} />
    )
  } else {
    return (
      <Link
        href={`/campaigns/${airdrop.id}`}
        className={`${
          authenticated
            ? eligible > 0
              ? 'hover:border-brand-ui-primary'
              : 'opacity-50 cursor-not-allowed hover:border-gray-200'
            : ''
        }`}
      >
        <CampaignCardInternal
          airdrop={airdrop}
          eligible={eligible}
          authenticated={authenticated}
        />
      </Link>
    )
  }
}
