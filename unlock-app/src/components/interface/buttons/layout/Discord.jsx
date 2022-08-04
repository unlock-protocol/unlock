import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Discord = (props) => (
  <LayoutButton href="https://discord.gg/Ah6ZEJyTDp" label="Discord" {...props}>
    <Svg.Discord name="Discord" />
  </LayoutButton>
)

export default Discord
