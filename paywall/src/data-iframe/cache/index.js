/**
 * All storage drivers are async
 */
export {
  get,
  put,
  getReadOnly,
  putReadOnly,
  clear,
  addListener,
  removeListener,
  storageId,
  getAccount,
  getNetwork,
  setAccount,
  setNetwork,
} from './localStorage'
