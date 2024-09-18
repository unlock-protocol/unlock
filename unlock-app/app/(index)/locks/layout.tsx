import { ReactNode } from 'react'

import { AuthRequired } from 'app/Components/ProtectedContent'

export default function LocksLayout({ children }: { children: ReactNode }) {
  return <AuthRequired>{children}</AuthRequired>
}
