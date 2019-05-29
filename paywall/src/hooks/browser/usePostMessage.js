import { useCallback, useRef } from 'react'
import useConfig from '../utils/useConfig'
import { getRouteFromWindow } from '../../utils/routes'
import useWindow from './useWindow'

export default function usePostMessage() {
  const window = useWindow()
  const { isInIframe, isServer } = useConfig()
  // track the last message sent. useRef is the equivalent to using this.lastMessage in a class-based component
  const lastMessage = useRef()
  const postMessage = useCallback(
    message => {
      const { origin } = getRouteFromWindow(window)
      if (
        isServer ||
        !isInIframe ||
        !message ||
        !origin ||
        lastMessage.current === message
      )
        return
      lastMessage.current = message
      window.parent.postMessage(message, origin)
    },
    [isServer, isInIframe, window]
  )
  return { postMessage }
}
