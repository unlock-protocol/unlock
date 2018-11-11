import React from 'react'
import Svg from '../../svg'
import { LayoutButton } from '../Button'

const About = () => (
  <LayoutButton href="/about" title="About">
    <Svg.About title="About" />
  </LayoutButton>
)

export default About
