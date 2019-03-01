import { useEffect, useState } from 'react'
import useConfig from '../utils/useConfig'
import { getRouteFromWindow } from '../../utils/routes'

export default function useListenForPostmessage(
  window,
  { type, validator = false, defaultValue }
) {
  const { isInIframe, isServer } = useConfig()
  const parent = window && window.parent
  const [data, setData] = useState(defaultValue)
  const saveData = event => {
    const { origin } = getRouteFromWindow(window)
    // ignore messages that do not come from our parent window
    if (event.source !== parent || event.origin !== origin) return
    // data must be of shape { type: 'type', payload: <value> }
    if (!event.data || !event.data.type) return
    if (!event.data.hasOwnProperty('payload')) return
    if (typeof event.data.type !== 'string') return
    if (event.data.type !== type) return
    // optional validator
    if (!validator || (validator && validator(event.data.payload))) {
      setData(event.data.payload)
    }
  }

  // this hook subscribes to messages on mount, and unsubscribes on unmount
  // it does not do it on update (component re-render)
  useEffect(() => {
    if (isServer || !isInIframe) return
    window.addEventListener('message', saveData)
    return () => {
      window.removeEventListener('message', saveData)
    }
  }, [])

  return data
}
