import { useEffect } from 'react'

import {
  POST_MESSAGE_CONFIG,
  POST_MESSAGE_READY,
} from '../paywall-builder/constants'
import useListenForPostMessage from './browser/useListenForPostMessage'
import usePostMessage from './browser/usePostMessage'

export default function usePaywallConfig() {
  const { postMessage } = usePostMessage()
  const paywallConfig = useListenForPostMessage({
    type: POST_MESSAGE_CONFIG,
  })
  useEffect(() => {
    postMessage(POST_MESSAGE_READY)
  }, []) // only send this once, on startup
  return paywallConfig
}
