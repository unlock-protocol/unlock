import React from 'react'
import { Metadata } from 'next'
import ReceiptsContent from '~/components/interface/Receipts'

export const metadata: Metadata = {
  title: 'Receipts',
  description: 'View your receipts.',
}

const ReceiptsPage: React.FC = () => {
  return <ReceiptsContent />
}

export default ReceiptsPage
