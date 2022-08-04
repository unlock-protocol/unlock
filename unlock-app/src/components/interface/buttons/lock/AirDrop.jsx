import React from 'react'
import Svg from '../../svg'
import Button from '../Button'
import UnlockPropTypes from '../../../../propTypes'
import DisabledButton from '../DisabledButton'

const AirDrop = ({ lock, ...props }) => {
  if (lock?.publicLockVersion < 7) {
    return (
      <DisabledButton {...props}>
        <Svg.Download name="Claim NFT" />
      </DisabledButton>
    )
  }
  return (
    <Button label="Claim NFT" {...props}>
      <Svg.Download name="Claim NFT" />
    </Button>
  )
}

AirDrop.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default AirDrop
