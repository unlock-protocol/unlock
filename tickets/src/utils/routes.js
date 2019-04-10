import { LOCK_PATH_NAME_REGEXP } from '../constants'

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
  const url = new URL(path, 'http://tickets.unlock-protocol.com')
  const match = url.pathname.match(LOCK_PATH_NAME_REGEXP)

  if (!match) {
    return {
      lockAddress: null,
      prefix: null,
    }
  }

  return {
    lockAddress: match[2] || null,
    prefix: match[1] || null,
  }
}

export default {
  lockRoute,
}
