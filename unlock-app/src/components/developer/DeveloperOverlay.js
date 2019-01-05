import React from 'react'
import { connect } from 'react-redux'
import NoSSR from 'react-no-ssr'
import styled from 'styled-components'
import { func } from 'prop-types'

import UnlockPropTypes from '../../propTypes'
import { setProvider } from '../../actions/provider'
import withConfig from '../../utils/withConfig'

export function DeveloperOverlay({ config, selected, setProvider }) {
  const providers = Object.keys(config.providers)
  if (config.env !== 'dev') return null

  return (
    <NoSSR>
      <Overlay>
        <Inner>
          <select
            value={selected}
            name="changeProvider"
            id="changeProvider"
            onChange={e => setProvider(e.target.value)}
          >
            {providers.map(provider => (
              <option value={provider} key={provider}>
                {provider}
              </option>
            ))}
          </select>
          <div>Choose Provider</div>
        </Inner>
      </Overlay>
    </NoSSR>
  )
}

DeveloperOverlay.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
  selected: UnlockPropTypes.provider,
  setProvider: func.isRequired,
}

DeveloperOverlay.defaultProps = {
  selected: '',
}

export const mapStateToProps = state => {
  return { selected: state.provider }
}

export default withConfig(
  connect(
    mapStateToProps,
    { setProvider }
  )(DeveloperOverlay)
)

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  display: flex;
  justify-content: center;
`

const Inner = styled.div`
  padding: 0 20px 10px 20px;
  border-color: lightgrey;
  border-left: 1px solid;
  border-right: 1px solid;
  border-bottom: 1px solid;
  border-radius: 0 0 20px 20px;
  transform: translateY(-21px);
  transition: transform 0.5s, color 0.5s, background-color 0.5s;
  color: lightgrey;

  &:hover {
    transform: translateY(0);
    opacity: 100%;
    color: white;
    background-color: var(--green);
    border-color: var(--green);
    font-weight: bold;
  }
`
