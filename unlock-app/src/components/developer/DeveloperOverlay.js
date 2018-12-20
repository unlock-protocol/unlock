import React, { Component } from 'react'
import UnlockPropTypes from '../../propTypes'

export class DeveloperOverlay extends Component {
  static propTypes = {
    providers: UnlockPropTypes.providerList.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { providers } = this.props

    return (
      <select>
        {providers.map(provider => (
          <option value={provider} key={provider}>
            {provider}
          </option>
        ))}
      </select>
    )
  }
}

export default DeveloperOverlay
