import { useEffect, useState, useReducer } from 'react'
import useWindow from './browser/useWindow'
import useConfig from './utils/useConfig'

// This hook uses fetch to retrieve a read-only API endpoint from locksmith.
// It takes a default value to return prior to the API success, and then
// replaces it upon receiving a result with the result.
// It only re-fetches if the api path changes.
export default function useLocksmith(api, defaultValue, active = true) {
  const window = useWindow()
  const { locksmithUri } = useConfig()
  const [result, setResult] = useState(defaultValue)
  const [reSend, reSendQuery] = useReducer(state => state + 1, 0)

  const fetch = window.fetch
  // remove double / if there are any
  const url = locksmithUri + ('/' + api).replace(/\/+/g, '/')

  useEffect(() => {
    if (!active) return
    fetch(url)
      .then(response => response.json())
      .then(result => setResult(result))
      .catch(error => console.error(error)) // eslint-disable-line no-console
  }, [api, reSend, active, fetch, url])
  return [result, reSendQuery]
}
