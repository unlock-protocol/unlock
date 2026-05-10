// ABOUTME: Tracks whether the user has accepted the terms of service.
// Persists acceptance in localStorage so the modal only shows once.
'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = '@unlock-governance.terms-of-service'

export function useTermsOfService() {
  const [termsLoading, setTermsLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setTermsAccepted(stored === 'true')
    } catch {
      setTermsAccepted(false)
    } finally {
      setTermsLoading(false)
    }
  }, [])

  const saveTermsAccepted = useCallback(() => {
    setTermsAccepted(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore storage errors
    }
  }, [])

  return { termsAccepted, saveTermsAccepted, termsLoading }
}
