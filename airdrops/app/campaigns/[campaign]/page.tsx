import { notFound } from 'next/navigation'
import CampaignDetailContent from '../../../components/CampaignDetailContent'
import airdrops from '../../../src/airdrops.json'
import { Metadata } from 'next'

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
      title: 'Campaign Not Found | Airdrops',
      description: 'The requested campaign could not be found.',
    }
  }

  return {
    title: `${campaign.name} | Airdrops`,
    description: campaign.description,
    openGraph: {
      title: `${campaign.name} | Airdrops`,
      description: campaign.description,
    },
    twitter: {
      card: 'summary',
      title: `${campaign.name} | Airdrops`,
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
