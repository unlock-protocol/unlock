import UnlockPropTypes from '../../../../propTypes'

import Svg from '../../svg'
import React from 'react'
import { LockButton } from '../Button'

const PreviewLock = ({ lock, ...props }) => (
  <LockButton href={`/demo/${lock.address}`} {...props}>
    <Svg.LockClosed />
  </LockButton>
)

PreviewLock.propTypes = {
  lock: UnlockPropTypes.lock,
}
export default PreviewLock
