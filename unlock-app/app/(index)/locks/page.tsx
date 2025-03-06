'use client'

import { Suspense } from 'react'
import LocksLoading from '~/components/interface/layouts/LocksLoading'
import { LockList } from '~/components/interface/locks/List/elements/LockList'

export default function LocksPage() {
  return (
    <Suspense fallback={<LocksLoading />}>
      <LockList />
    </Suspense>
  )
}
