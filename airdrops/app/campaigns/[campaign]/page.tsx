import { notFound } from 'next/navigation'
import CampaignDetailContent from '../../../components/CampaignDetailContent'
import airDrops from '../../../src/airdrops.json'
import { Metadata } from 'next'

export interface CampaignDetailPageProps {
  params: {
    campaign: string
  }
}

export async function generateMetadata({
  params,
}: CampaignDetailPageProps): Promise<Metadata> {
  const campaign = airDrops.find(
    (drop) => drop.contractAddress === params.campaign
  )

  if (!campaign) {
    return {
      title: 'Campaign Not Found | Airdrops',
      description: 'The requested campaign could not be found.',
    }
  }

  return {
    title: `${campaign.title} | Airdrops`,
    description: campaign.description,
    openGraph: {
      title: `${campaign.title} | Airdrops`,
      description: campaign.description,
    },
    twitter: {
      card: 'summary',
      title: `${campaign.title} | Airdrops`,
      description: campaign.description,
    },
  }
}

const CampaignDetailPage = async ({ params }: CampaignDetailPageProps) => {
  const campaign = airDrops.find(
    (drop) => drop.contractAddress === params.campaign
  )

  if (!campaign) {
    notFound()
  }

  return <CampaignDetailContent campaign={campaign} />
}

export default CampaignDetailPage
