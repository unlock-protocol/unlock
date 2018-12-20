import React, { Component } from 'react'
import UnlockPropTypes from '../../propTypes'

export class DeveloperOverlay extends Component {
  static propTypes = {
    providers: UnlockPropTypes.providerList.isRequired,
    selected: UnlockPropTypes.provider,
  }

  static defaultProps = {
    selected: '',
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { providers, selected } = this.props

    return (
      <select value={selected}>
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
