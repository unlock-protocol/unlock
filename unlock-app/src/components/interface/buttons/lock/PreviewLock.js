import React from 'react'
import UnlockPropTypes from '../../../../propTypes'

import Svg from '../../svg'
import { LockButton } from '../Button'

const PreviewLock = ({ lock, ...props }) => (
  <LockButton href={`/demo/${lock.transaction}`} {...props}>
    <Svg.LockClosed />
  </LockButton>
)

PreviewLock.propTypes = {
  lock: UnlockPropTypes.lock,
}
export default PreviewLock
