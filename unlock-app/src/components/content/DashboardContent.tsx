import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const DashboardContent = () => {
  const router = useRouter()

  useEffect(() => {
    // force redirect to new lock page
    router.push('/locks')
  }, [router])

  return null
}

export default DashboardContent
