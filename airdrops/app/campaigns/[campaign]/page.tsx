import { notFound } from 'next/navigation'
import CampaignDetailContent from '../../../components/CampaignDetailContent'
import airdrops from '../../../src/airdrops.json'
import { Metadata } from 'next'
import { config } from '../../../src/config/app'

export interface CampaignDetailPageProps {
  params: {
    campaign: string
  }
}

export async function generateMetadata({
  params,
}: CampaignDetailPageProps): Promise<Metadata> {
  const campaign = airdrops.find((drop) => drop.id === params.campaign)

  if (!campaign) {
    return {
      title: `Campaign Not Found | ${config.appName.default}`,
    }
  }

  return {
    title: `${campaign.name} | ${config.appName.default}`,
    description: campaign.description,
    openGraph: {
      title: `${campaign.name} | ${config.appName.default}`,
      description: campaign.description,
    },
    twitter: {
      title: `${campaign.name} | ${config.appName.default}`,
      description: campaign.description,
    },
  }
}

const CampaignDetailPage = async ({ params }: CampaignDetailPageProps) => {
  const airdrop = airdrops.find((drop) => drop.id === params.campaign)

  if (!airdrop) {
    notFound()
  }

  return <CampaignDetailContent airdrop={airdrop} />
}

export default CampaignDetailPage
