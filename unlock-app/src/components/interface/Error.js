import { connect } from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Buttons from './buttons/layout'

import { resetError } from '../../actions/error'
import { ErrorMapper } from '../helpers/ErrorMapper'

export const Error = ({ children, error, close, locale = 'en' }) => {
  const content =
    children || (error && <ErrorMapper error={error} locale={locale} />)
  if (!content) {
    return null
  }
  return (
    <Wrapper>
      {content}
      <Buttons.Close as="button" onClick={close} size="16px">
        X
      </Buttons.Close>
    </Wrapper>
  )
}

const mapStateToProps = ({ errors, locale = 'en' }) => ({
  error: errors.length ? errors[errors.length - 1] : null,
  locale,
})

const mapDispatchToProps = dispatch => ({
  close: () => {
    dispatch(resetError())
  },
})

Error.propTypes = {
  children: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  close: PropTypes.func.isRequired,
  locale: PropTypes.string,
}

Error.defaultProps = {
  children: null,
  error: null,
  locale: 'en',
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Error)

const Wrapper = styled.section`
  grid-template-columns: 1fr 20px;
  display: grid;
  border: 1px solid var(--lightgrey);
  border-radius: 4px;
  font-size: 16px;
  justify-items: center;
  justify-content: center;
  align-items: center;
  padding-right: 8px;
  grid-gap: 8px;
  a {
    color: var(--red);
  }
`
