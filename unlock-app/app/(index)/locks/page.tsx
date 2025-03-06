'use client'

import { Suspense } from 'react'
import LocksLoading from '~/components/interface/layouts/LocksLoading'
import LocksListContent from '../../../src/components/interface/locks/List/LockListContent'

export default function LocksPage() {
  return (
    <Suspense fallback={<LocksLoading />}>
      <LocksListContent />
    </Suspense>
  )
}
