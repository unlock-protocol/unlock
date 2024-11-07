import React from 'react'
import { Metadata } from 'next'
import { SHARED_METADATA } from '~/config/seo'
import { MigrateUserContent } from '~/components/legacy-auth/MigrateUserContent'

export const metadata: Metadata = {
  ...SHARED_METADATA,
  title: 'Migrate Account - Unlock',
  description: 'Migrate your account from the old auth system to the new one.',
}

const MigrateUserPage: React.FC = () => {
  return <MigrateUserContent />
}

export default MigrateUserPage
