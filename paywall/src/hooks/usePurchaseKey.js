import { useCallback } from 'react'
import usePostMessage from './browser/usePostMessage'
import { PostMessages } from '../messageTypes'

export default function usePurchaseKey(purchaseKey, openInNewWindow) {
  const { postMessage } = usePostMessage('usePurchaseKey')
  return useCallback(
    key => {
      if (openInNewWindow) {
        return postMessage(PostMessages.REDIRECT)
      }
      purchaseKey(key)
    },
    [purchaseKey, postMessage, openInNewWindow]
  )
}
