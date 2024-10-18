import React from 'react'
import { Metadata } from 'next'
import { Transfer as TransferContent } from '~/components/interface/transfer'

export const metadata: Metadata = {
  title: 'Transfer | Unlock Protocol',
  description: 'Transfer your membership to another account.',
}

const TransferPage: React.FC = () => {
  return <TransferContent />
}

export default TransferPage
