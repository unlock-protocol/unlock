import React, { Fragment } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Title } from '../EventContent'
import SvgIconCheckmark from '../../interface/svg/IconCheckmark'
import SvgIconBg from '../../interface/svg/IconBg'

export const ValidationIcon = ({ valid }) => {
  if (valid === true) {
    return (
      <Fragment>
        <ValidTitle>Ticket Valid</ValidTitle>
        <IconHolder>
          <SvgIconCheckmark />
        </IconHolder>
      </Fragment>
    )
  } else if (valid === false) {
    return (
      <Fragment>
        <Title>Ticket Not Valid</Title>
        <IconHolder>
          <SvgIconBg />
        </IconHolder>
      </Fragment>
    )
  } else {
    return (
      <Fragment>
        <Title>Ticket Validating</Title>
        <IconHolder>
          <SvgIconBg />
        </IconHolder>
      </Fragment>
    )
  }
}

ValidationIcon.propTypes = {
  valid: PropTypes.bool,
}

ValidationIcon.defaultProps = {
  valid: null,
}

export default ValidationIcon

const IconHolder = styled.div`
  max-width: 200px;
  margin: auto;
`

const ValidTitle = styled(Title)`
  color: var(--link);
`
