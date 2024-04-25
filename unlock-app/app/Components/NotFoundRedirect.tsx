'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export const NotFoundRedirect = () => {
  const router = useRouter()
  const path = usePathname()
  useEffect(() => {
    router.replace(`/404?path=${path}`)
  })
  return null
}
