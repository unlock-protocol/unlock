import { Component } from 'react'
import PropTypes from 'prop-types'

import { lockPage, unlockPage } from '../../services/iframeService'
import UnlockPropTypes from '../../propTypes'

export default class IframeHandler extends Component {
  componentDidMount() {
    this.handleIframeService()
  }
  componentDidUpdate() {
    this.handleIframeService()
  }

  handleIframeService() {
    const { keys, modalShown } = this.props
    if (keys.length > 0 && !modalShown) {
      unlockPage()
    } else {
      lockPage()
    }
  }

  render() {
    return null
  }
}

IframeHandler.propTypes = {
  keys: PropTypes.arrayOf(UnlockPropTypes.key).isRequired,
  modalShown: PropTypes.bool.isRequired,
}
