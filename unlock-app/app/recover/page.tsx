import { Metadata } from 'next'
import RecoverContent from '~/components/content/RecoverContent'
import { SHARED_METADATA } from '~/config/seo'

export const metadata: Metadata = {
  ...SHARED_METADATA,
  title: 'Account Recovery',
  description: 'Recover your Unlock Protocol account access.',
}

const RecoverPage = () => {
  return <RecoverContent />
}

export default RecoverPage
