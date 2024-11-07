import React from 'react'
import { Metadata } from 'next'
import SettingsContent from '~/components/content/SettingsContent'

export const metadata: Metadata = {
  title: 'Account Settings | Unlock Protocol',
  description:
    'Manage your account settings and payment methods for Unlock Protocol.',
}

const SettingsPage: React.FC = () => {
  return <SettingsContent />
}

export default SettingsPage
