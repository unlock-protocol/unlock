import { useEffect, useState } from 'react'
import useConfig from '../utils/useConfig'
import { getRouteFromWindow } from '../../utils/routes'

export default function useListenForPostmessage(window) {
  const { isInIframe, isServer } = useConfig()
  const parent = window && window.parent
  const [data, setData] = useState()
  const saveData = event => {
    const { origin } = getRouteFromWindow(window)
    // ignore messages that do not come from our parent window
    if (event.source !== parent || event.origin !== origin) return
    setData(event.data)
  }

  // this hook subscribes to messages on mount, and unsubscribes on unmount
  // it does not do it on update (component re-render)
  useEffect(() => {
    if (isServer || !isInIframe || !window) return
    window.addEventListener('message', saveData)
    return () => {
      window.removeEventListener('message', saveData)
    }
  }, [])

  return data
}
