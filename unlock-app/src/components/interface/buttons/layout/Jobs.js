import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

import withConfig from '../../../../utils/withConfig'
import UnlockPropTypes from '../../../../propTypes'

const Jobs = ({ config, ...props }) => (
  <LayoutButton
    href={`${config.unlockStaticUrl}/jobs`}
    label="Join us"
    {...props}
  >
    <Svg.Jobs name="Jobs" />
  </LayoutButton>
)

Jobs.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(Jobs)
