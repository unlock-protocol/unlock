import { Suspense } from 'react'
import LocksLoading from '~/components/interface/layouts/LocksLoading'
import LocksClient from './client'

export const metadata = {
  title: 'Locks',
  description:
    'A Lock is a membership smart contract you create, deploy, and own on Unlock Protocol.',
}

export default function LocksPage() {
  return (
    <Suspense fallback={<LocksLoading />}>
      <LocksClient />
    </Suspense>
  )
}
