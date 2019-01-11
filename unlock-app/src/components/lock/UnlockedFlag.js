import styled from 'styled-components'
import React from 'react'
import { connect } from 'react-redux'
import { RoundedLogo } from '../interface/Logo'
import { Colophon } from './Overlay'
import { mapStateToProps } from './ShowUnlessUserHasKeyToAnyLock'

export const UnlockedFlag = () => {
  return (
    <Flag>
      <RoundedLogo size="28px" />
      <p>Subscribed by Unlock</p>
    </Flag>
  )
}

export default connect(mapStateToProps)(UnlockedFlag)

const Flag = styled(Colophon)`
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  background: var(--white);
  position: fixed;
  right: 0;
  bottom: 105px;
`
