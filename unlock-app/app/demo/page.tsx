import React from 'react'
import { Metadata } from 'next'
import DemoContent from '~/components/content/DemoContent'

export const metadata: Metadata = {
  title: 'Unlock Demo Example - Unlock Times',
  description: 'This is a demo page to test your checkout flow.',
}

const DemoPage: React.FC = () => {
  return <DemoContent />
}

export default DemoPage
