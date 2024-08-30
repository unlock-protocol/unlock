'use client'

import { useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { config } from '~/config/app'

export default function TagManagerScript() {
  useEffect(() => {
    if (!config.isServer) {
      if (config.env === 'prod' && config.tagManagerArgs) {
        TagManager.initialize(config.tagManagerArgs)
      }
    }
  }, [])

  return null
}
