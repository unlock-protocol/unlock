import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Buttons from './buttons/layout'

export const Error = ({ children }) => (
  <Wrapper>
    {children}
    <Buttons.Close as="button" size="16px">X</Buttons.Close>
  </Wrapper>
)

Error.propTypes = {
  children: PropTypes.node,
}

Error.defaultProps = {
  children: null,
}

export default Error

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
