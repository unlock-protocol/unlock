import Link from 'next/link'
import dynamic from 'next/dynamic'
import React from 'react'
import UnlockPaywall from '../components/UnlockPaywall'

export default function Home() {
  return (
    <div>
      <Link href="https://docs.unlock-protocol.com/tools/paywall">Docs</Link>
      <UnlockPaywall />
    </div>
  )
}
