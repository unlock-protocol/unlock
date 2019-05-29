import {
  LOCK_PATH_NAME_REGEXP,
  ACCOUNT_REGEXP,
  TRANSACTION_REGEXP,
} from '../constants'

if (!global.URL) {
  // polyfill for server
  global.URL = function() {
    return {
      pathname: '',
      hash: false,
    }
  }
}
/**
 * Returns a hash of lockAddress and prefix based on a path.
 * @param {*} path
 */
export const lockRoute = path => {
  // note: undocumented "feature" of the URL class is that it throws
  // if the URL is invalid. In our case, we are passing in a relative path,
  // and so it throws unless we pass in a base url. Since the base URL
  // is not used, this passes in an unused URL
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
  const url = new URL(path, 'http://paywall.unlock-protocol.com')
  const match = url.pathname.match(LOCK_PATH_NAME_REGEXP)

  if (!match) {
    return {
      lockAddress: null,
      prefix: null,
      redirect: null,
      account: null,
      transaction: null,
      origin: url.searchParams.has('origin')
        ? url.searchParams.get('origin')
        : null,
    }
  }

  let account = url.hash && url.hash.substring(1)
  let transaction = url.hash && url.hash.substring(1)
  const matchAccount = account.match(ACCOUNT_REGEXP)
  const matchTransaction = account.match(TRANSACTION_REGEXP)
  account = matchAccount ? matchAccount[0] : null
  transaction = matchTransaction ? matchTransaction[0] : null

  return {
    lockAddress: match[2] || null,
    prefix: match[1] || null,
    redirect: (match[3] && decodeURIComponent(match[3])) || null,
    account,
    transaction,
    origin: url.searchParams.has('origin')
      ? url.searchParams.get('origin')
      : null,
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
