import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import SvgLoading from './svg/Loading'

const Loading = ({ message }) => {
  const [showMessage, setShowMessage] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true)
    }, 3000)
    return () => {
      clearTimeout(timer)
    }
  })
  return (
    <LoadingWrapper>
      {!showMessage && <SvgLoading title="loading" alt="loading" />}
      {showMessage && <span>{message}</span>}
    </LoadingWrapper>
  )
}

Loading.propTypes = {
  message: PropTypes.string,
}

Loading.defaultProps = {
  message: '',
}

export default Loading

const LoadingWrapper = styled.section`
  svg {
    fill: var(--lightgrey);
    width: 60px;
  }
`
