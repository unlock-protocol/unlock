import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

import withConfig from '../../../../utils/withConfig'
import UnlockPropTypes from '../../../../propTypes'

const About = ({ config, ...props }) => (
  <LayoutButton
    href={`${config.unlockStaticUrl}/about`}
    label="About"
    {...props}
  >
    <Svg.About title="About" />
  </LayoutButton>
)

About.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(About)
