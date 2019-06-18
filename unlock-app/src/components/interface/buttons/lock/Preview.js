import React from 'react'
import UnlockPropTypes from '../../../../propTypes'

import Svg from '../../svg'
import Button from '../Button'

import withConfig from '../../../../utils/withConfig'

const Preview = ({ lock, config, ...props }) => (
  <Button
    href={`${config.paywallUrl}/newdemo?lock=${lock.address}&name=${
      lock.name
    }&type=paywall`}
    label="Preview"
    {...props}
  >
    <Svg.Preview name="Preview Lock" />
  </Button>
)

Preview.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(Preview)
