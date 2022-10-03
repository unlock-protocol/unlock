import React, { useEffect } from 'react'

import { useRouter } from 'next/router'

export const DashboardContent = () => {
  const router = useRouter()

  useEffect(() => {
    // force redirect to the new dashboard
    router.push('/locks')
  }, [router])

  return null
}

export default DashboardContent
