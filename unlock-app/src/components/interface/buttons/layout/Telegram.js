import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Telegram = props => (
  <LayoutButton
    href="https://t.me/unlockprotocol"
    target="_blank"
    label="Telegram"
    {...props}
  >
    <Svg.Telegram name="Telegram" />
  </LayoutButton>
)

export default Telegram
