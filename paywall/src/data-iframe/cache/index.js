/**
 * All storage drivers are async
 */
export {
  get,
  put,
  merge,
  clear,
  merge,
  addListener,
  removeListener,
  storageId,
  getAccount,
  getNetwork,
  setAccount,
  setNetwork,
} from './localStorage'
