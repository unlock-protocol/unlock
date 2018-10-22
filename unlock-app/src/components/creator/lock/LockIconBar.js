import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../../propTypes'
import Buttons from '../../interface/buttons/lock'

export class LockIconBar extends React.Component {
  constructor (props, context) {
    super(props)
  }

  toggleCode() {
    console.log('good day')
  }

  render() {
    return (
      <IconBar>
        <Buttons.PreviewLock lock={this.props.lock} />
        <Buttons.Withdraw />
        <Buttons.Edit />
        { /* Reinstate when we're ready <Buttons.ExportLock /> */ }
        <Buttons.Code onClick={this.props.toggleCodeFunction} />
      </IconBar>
    )
  }
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock,
  toggleCodeFunction: PropTypes.func,
}

export default LockIconBar

const IconBar = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(4, 24px);
`
