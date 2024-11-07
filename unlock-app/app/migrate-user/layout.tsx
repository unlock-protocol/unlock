'use client'
import { ReactNode } from 'react'

import LegacyAuthWrapper from '~/components/legacy-auth/LegacyAuthWrapper'

export default function MigrateUserLayout({
  children,
}: {
  children: ReactNode
}) {
  return <LegacyAuthWrapper>{children}</LegacyAuthWrapper>
}
