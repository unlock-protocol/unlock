import { ReactNode } from 'react'

import { AuthRequired } from 'app/Components/ProtectedContent'

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <AuthRequired>{children}</AuthRequired>
}
