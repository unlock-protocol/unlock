import v12 from '../v12'
import abis from '../../abis'
import addKeyGranter from './addKeyGranter'
import removeKeyGranter from './removeKeyGranter'
import isKeyGranter from './isKeyGranter'

export default {
  ...v12,
  version: 'v13',
  addKeyGranter,
  removeKeyGranter,
  isKeyGranter,
  PublicLock: abis.PublicLock.v13,
}
