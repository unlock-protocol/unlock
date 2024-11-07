'use client'
import { ReactNode, useState } from 'react'

import LegacyAuthWrapper from '~/components/legacy-auth/LegacyAuthWrapper'
import ProviderContext from '~/contexts/ProviderContext'

export default function MigrateUserLayout({
  children,
}: {
  children: ReactNode
}) {
  const [provider, setProvider] = useState<any>(null)

  return (
    <ProviderContext.Provider value={{ provider, setProvider }}>
      <LegacyAuthWrapper providerAdapter={provider}>
        {children}
      </LegacyAuthWrapper>
    </ProviderContext.Provider>
  )
}
