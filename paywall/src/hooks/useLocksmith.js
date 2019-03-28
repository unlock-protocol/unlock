import { useEffect, useState } from 'react'
import useWindow from './browser/useWindow'
import useConfig from './utils/useConfig'

export default function useLocksmith(api, defaultValue) {
  const window = useWindow()
  const { locksmithUri } = useConfig()
  const [result, setResult] = useState(defaultValue)

  const fetch = window.fetch
  // remove double / if there are any
  const url = locksmithUri + ('/' + api).replace(/\/+/g, '/')

  useEffect(() => {
    fetch(url)
      .then(response => setResult(response.json()))
      .catch(error => console.error(error)) // eslint-disable-line no-console
  }, [api])
  return result
}
