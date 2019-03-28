import { useCallback, useRef } from 'react'
import useConfig from '../utils/useConfig'
import { getRouteFromWindow } from '../../utils/routes'
import useWindow from './useWindow'

export default function usePostMessage() {
  const window = useWindow()
  const { isInIframe, isServer } = useConfig()
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
    }, // not just when the postMessage call has changed the state to something else // This is important because the hook will be called on every render, // this next line tells React to only post the message if it has changed.
    // and we only want to post the message on the very first time it is requested
    [isServer, isInIframe]
  )
  return { postMessage }
}
