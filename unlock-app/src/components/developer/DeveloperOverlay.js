import React from 'react'
import UnlockPropTypes from '../../propTypes'

export function DeveloperOverlay({ config, selected, selectProvider }) {
  const providers = Object.keys(config.providers)
  return (
    <select value={selected} onChange={e => selectProvider(e.target.value)}>
      {providers.map(provider => (
        <option value={provider} key={provider}>
          {provider}
        </option>
      ))}
    </select>
  )
}

DeveloperOverlay.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
  selected: UnlockPropTypes.provider,
  selectProvider: UnlockPropTypes.callback.isRequired,
}

DeveloperOverlay.defaultProps = {
  selected: '',
}
export default DeveloperOverlay
