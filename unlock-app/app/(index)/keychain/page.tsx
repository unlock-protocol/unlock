import React from 'react'
import { Metadata } from 'next'
import KeychainContent from '~/components/content/KeychainContent'

export const metadata: Metadata = {
  title: 'Member Keychain',
  description: 'Manage your keys in the member keychain.',
}

const KeychainPage: React.FC = () => {
  return <KeychainContent />
}

export default KeychainPage
