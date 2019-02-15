import { useEffect, useState } from 'react'
import useConfig from '../utils/useConfig'

export default function useListenForPostmessage(window) {
  const { isInIframe, isServer } = useConfig()
  const parent = window && window.parent
  const [data, setData] = useState()
  const saveData = event => {
    if (event.source !== parent || event.origin !== parent.origin) return
    setData(event.data)
  }

  useEffect(() => {
    if (isServer || !isInIframe || !window) return
    window.addEventListener('message', saveData)
    return () => {
      window.removeEventListener('message', saveData)
    }
  })

  return data
}
