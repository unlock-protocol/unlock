import React from 'react'
import UnlockPropTypes from '../../../../propTypes'

import Svg from '../../svg'
import { LockButton } from '../Button'

const PreviewLock = ({ lock, ...props }) => (
  <LockButton href={`/demo/${lock.address}`} title='Preview lock' {...props}>
    <Svg.LockClosed name="Preview Lock" />
  </LockButton>
)

PreviewLock.propTypes = {
  lock: UnlockPropTypes.lock,
}
export default PreviewLock
