import React from 'react'
import { useSearchParams } from 'next/navigation'
import RecoverContent from '../components/content/RecoverContent'

const Recover = () => {
  const searchParams = useSearchParams()
  return <RecoverContent query={searchParams} />
}

export default Recover
