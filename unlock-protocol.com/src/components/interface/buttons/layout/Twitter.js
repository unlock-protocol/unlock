import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Twitter = props => (
  <LayoutButton
    href="https://twitter.com/UnlockProtocol"
    label="Twitter"
    {...props}
  >
    <Svg.Twitter name="Twitter" />
  </LayoutButton>
)

export default Twitter
