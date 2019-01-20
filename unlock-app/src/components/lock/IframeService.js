import { Component } from 'react'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../propTypes'
import { lockPage, unlockPage } from '../../services/iframeService'

export default class IframeService extends Component {
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

IframeService.propTypes = {
  keys: PropTypes.arrayOf(UnlockPropTypes.key),
  modalShown: PropTypes.bool,
}

IframeService.defaultProps = {
  keys: [],
  modalShown: false,
}
