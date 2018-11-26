import React from 'react'
import Svg from '../../svg'
import { LayoutButton } from '../Button'

const Telegram = props => (
  <LayoutButton href="/telegram" title="Telegram" {...props}>
    <Svg.Telegram name="Telegram" />
  </LayoutButton>
)

export default Telegram
