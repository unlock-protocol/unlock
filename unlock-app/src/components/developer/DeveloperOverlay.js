import React from 'react'
import UnlockPropTypes from '../../propTypes'

export const DeveloperOverlay = ({ providers, selected }) => (
  <select value={selected}>
    {providers.map(provider => (
      <option value={provider} key={provider}>
        {provider}
      </option>
    ))}
  </select>
)

DeveloperOverlay.propTypes = {
  providers: UnlockPropTypes.providerList.isRequired,
  selected: UnlockPropTypes.provider,
}

DeveloperOverlay.defaultProps = {
  selected: '',
}
export default DeveloperOverlay
