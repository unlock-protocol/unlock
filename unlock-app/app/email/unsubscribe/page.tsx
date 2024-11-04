import React from 'react'
import { Metadata } from 'next'
import UnsubscribeContent from '~/components/content/UnsubscribeContent'
import { SHARED_METADATA } from '~/config/seo'

export const metadata: Metadata = {
  ...SHARED_METADATA,
  title: 'Unsubscribe',
  description: 'Unsubscribe from Unlock emails.',
}

const UnsubscribePage: React.FC = () => {
  return <UnsubscribeContent />
}

export default UnsubscribePage
