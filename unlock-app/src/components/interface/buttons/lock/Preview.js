import React from 'react'
import UnlockPropTypes from '../../../../propTypes'

import Svg from '../../svg'
import Button from '../Button'

const Preview = ({ lock, ...props }) => (
  <Button href={`/demo/${lock.address}`} label="Preview lock" {...props}>
    <Svg.Preview name="Preview Lock" />
  </Button>
)

Preview.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default Preview
