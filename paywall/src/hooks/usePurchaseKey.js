import { useCallback } from 'react'
import usePostMessage from './browser/usePostMessage'
import { POST_MESSAGE_REDIRECT } from '../paywall-builder/constants'

export default function usePurchaseKey(purchaseKey, openInNewWindow) {
  const { postMessage } = usePostMessage('usePurchaseKey')
  return useCallback(
    key => {
      if (openInNewWindow) {
        return postMessage(POST_MESSAGE_REDIRECT)
      }
      purchaseKey(key)
    },
    [purchaseKey, postMessage, openInNewWindow]
  )
}
