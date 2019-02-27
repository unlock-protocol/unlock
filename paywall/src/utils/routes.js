import { LOCK_PATH_NAME_REGEXP, ACCOUNT_REGEXP } from '../constants'

/**
 * Returns a hash of lockAddress and prefix based on a path.
 * @param {*} path
 */
export const lockRoute = path => {
  const url = new URL(path, 'http://dummy.com')
  const match = url.pathname.match(LOCK_PATH_NAME_REGEXP)

  if (!match) {
    return {
      lockAddress: null,
      prefix: null,
      redirect: null,
      account: null,
    }
  }

  let account = url.hash && url.hash.substring(1)
  const matchAccount = account.match(ACCOUNT_REGEXP)
  account = matchAccount ? matchAccount[0] : undefined

  return {
    lockAddress: match[2],
    prefix: match[1],
    redirect: match[3] && decodeURIComponent(match[3]),
    account,
    origin: url.searchParams.has('origin')
      ? url.searchParams.get('origin')
      : undefined,
  }
}

export function getRouteFromWindow(window) {
  if (!window) {
    return lockRoute('')
  }
  return lockRoute(
    window.location.pathname + window.location.search + window.location.hash
  )
}
