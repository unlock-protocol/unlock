import { useEffect, useState } from 'react'
import useWindow from './browser/useWindow'
import useConfig from './utils/useConfig'

// This hook uses fetch to retrieve a read-only API endpoint from locksmith.
// It takes a default value to return prior to the API success, and then
// replaces it upon receiving a result with the result.
// It only re-fetches if the api path changes.
export default function useLocksmith(api, defaultValue) {
  const window = useWindow()
  const { locksmithHost } = useConfig()
  const [result, setResult] = useState(defaultValue)

  const fetch = window.fetch
  // remove double / if there are any
  const url = locksmithHost + ('/' + api).replace(/\/+/g, '/')

  useEffect(() => {
    fetch(url)
      .then(response => setResult(response.json()))
      .catch(error => console.error(error)) // eslint-disable-line no-console
  }, [api])
  return result
}
