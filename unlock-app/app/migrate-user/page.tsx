import React from 'react'
import { Metadata } from 'next'
import { SHARED_METADATA } from '~/config/seo'
import { MigrateUserContent } from '~/components/legacy-auth/MigrateUserContent'

export const metadata: Metadata = {
  ...SHARED_METADATA,
  title: 'Migrate Account - Unlock',
  description: 'Migrate your legacy Unlock account.',
}

const MigrateUserPage: React.FC = () => {
  return <MigrateUserContent />
}

export default MigrateUserPage
