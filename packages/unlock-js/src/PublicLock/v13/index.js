import v12 from '../v12'
import abis from '../../abis'
import addKeyGranter from './addKeyGranter'
import isKeyGranter from './isKeyGranter'

export default {
  ...v12,
  version: 'v13',
  addKeyGranter,
  isKeyGranter,
  PublicLock: abis.PublicLock.v13,
}
