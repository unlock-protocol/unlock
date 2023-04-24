import v12 from '../v12'
import abis from '../../abis'
import addKeyGranter from './addKeyGranter'

export default {
  ...v12,
  version: 'v13',
  addKeyGranter,
  PublicLock: abis.PublicLock.v13,
}
