import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { RoundedLogo } from '../interface/Logo'
import { Colophon } from './Overlay'
import { mapStateToProps } from './ShowUnlessUserHasKeyToAnyLock'

export const UnlockedFlag = ({ keys }) => {
  return (
    <Flag>
      <RoundedLogo size="28px" />
      <p>Subscribed by Unlock</p>
    </Flag>
  )
}

UnlockedFlag.propTypes = {
  keys: PropTypes.arrayOf(UnlockPropTypes.key),
}

export default connect(mapStateToProps)(UnlockedFlag)

const Flag = styled(Colophon)`
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  background: var(--white);
`
