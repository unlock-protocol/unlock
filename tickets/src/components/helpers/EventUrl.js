import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'

export const EventUrl = ({ address }) => {
  if (!address) {
    return <span />
  }

  const path = `/event/${address}`
  const url = `https://tickets.unlock-protocol.com${path}`

  return (
    <Text>
      Your event link: <br />
      <Cta href={path} target="_blank">
        {url}
      </Cta>
    </Text>
  )
}

EventUrl.propTypes = {
  address: PropTypes.string,
}

EventUrl.defaultProps = {
  address: null,
}

export default EventUrl

const Text = styled.label`
  font-size: 13px;
  color: var(--darkgrey);
`

const Cta = styled.a`
  clear: both;
  font-size: 16px;
  color: var(--link);
`
