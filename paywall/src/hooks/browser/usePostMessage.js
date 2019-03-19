import { useEffect, useState } from 'react'
import useConfig from '../utils/useConfig'
import { getRouteFromWindow } from '../../utils/routes'
import useWindow from './useWindow'

export default function usePostMessage() {
  const window = useWindow()
  const { isInIframe, isServer } = useConfig()
  const [message, postMessage] = useState()
  useEffect(
    () => {
      const { origin } = getRouteFromWindow(window)
      if (isServer || !isInIframe || !message || !origin) return
      window.parent.postMessage(message, origin)
    }, // This is important because the hook will be called on every render, // this next line tells React to only post the message if it has changed.
    // not just when the postMessage call has changed the state to something else
    // and we only want to post the message on the very first time it is requested
    [message]
  )
  return { postMessage }
}
