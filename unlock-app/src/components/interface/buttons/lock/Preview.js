import React from 'react'
import UnlockPropTypes from '../../../../propTypes'

import Svg from '../../svg'
import { LockButton } from '../Button'

const Preview = ({ lock, ...props }) => (
  <LockButton href={`/demo/${lock.address}`} title="Preview lock" {...props}>
    <Svg.Preview name="Preview Lock" />
  </LockButton>
)

Preview.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default Preview
