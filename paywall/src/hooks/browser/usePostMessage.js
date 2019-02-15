import { useEffect, useState } from 'react'
import useConfig from '../utils/useConfig'

export default function usePostmessage(window) {
  const { isInIframe, isServer } = useConfig()
  const [message, postMessage] = useState()
  useEffect(
    () => {
      if (isServer || !isInIframe || !message) return
      window.parent.postMessage(message, window.parent.origin)
    },
    // this next line tells React to only post the message if it has changed.
    // This is important because the hook will be called on every render,
    // not just when the postMessage call has changed the state to something else
    // and we only want to post the message on the very first time it is requested
    [message]
  )
  return { postMessage }
}
