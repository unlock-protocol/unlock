import { useCallback, useRef } from 'react'
import useConfig from '../utils/useConfig'
import { getRouteFromWindow } from '../../utils/routes'
import useWindow from './useWindow'

export default function usePostMessage(local = 'iframe') {
  const window = useWindow()
  const { isInIframe, isServer, debugMode } = useConfig()
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
      if (debugMode) {
        // eslint-disable-next-line no-console
        console.log(`[uPM] ${local} --> main window`, message, origin)
      }
      window.parent.postMessage(message, origin)
    },
    [window, isServer, isInIframe, debugMode, local]
  )
  return { postMessage }
}
