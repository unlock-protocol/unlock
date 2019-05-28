import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import withConfig from '../../utils/withConfig'
import UnlockPropTypes from '../../propTypes'

export const EventUrl = ({ address, config }) => {
  if (!address) {
    return <span />
  }

  const path = `/event/${address}`
  const url = config.unlockTicketsUrl + path

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
  config: UnlockPropTypes.configuration.isRequired,
}

EventUrl.defaultProps = {
  address: null,
}

export default withConfig(EventUrl)

const Text = styled.label`
  font-size: 13px;
  color: var(--darkgrey);
`

const Cta = styled.a`
  clear: both;
  font-size: 16px;
  color: var(--link);
`
