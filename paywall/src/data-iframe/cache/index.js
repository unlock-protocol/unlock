/**
 * All storage drivers are async
 */
export {
  get,
  put,
  merge,
  clear,
  addListener,
  removeListener,
  storageId,
  getAccount,
  getNetwork,
  setAccount,
  setNetwork,
} from './localStorage'
