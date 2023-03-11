import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const DashboardContent = () => {
  const router = useRouter()

  useEffect(() => {
    // force redirect to new lock page
    router.push('/locks')
  }, [router])

  return null
}

export default DashboardContent
