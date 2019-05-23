/**
 * All storage drivers are async
 */
export {
  get,
  put,
  clear,
  addListener,
  removeListener,
  storageId,
  getAccount,
  getNetwork,
  setAccount,
  setNetwork,
} from './localStorage'
