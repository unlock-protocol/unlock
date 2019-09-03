import { Component } from 'react'
import { node } from 'prop-types'
import * as UnlockPropTypes from '../../propTypes'

export default class SuspendedRender extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
    }
    this.mountTimeout = null
  }

  componentDidMount() {
    const { delay } = this.props
    this.mountTimeout = setTimeout(() => {
      if (this.mountTimeout === null) return
      this.setState({ show: true })
    }, delay)
  }

  componentWillUnmount() {
    if (this.mountTimeout !== null) {
      clearTimeout(this.mountTimeout)
      this.mountTimeout = null
    }
  }

  render() {
    const { show } = this.state
    const { children } = this.props
    if (!show) return null
    return children
  }
}

SuspendedRender.propTypes = {
  children: node.isRequired,
  delay: UnlockPropTypes.delay,
}

SuspendedRender.defaultProps = {
  delay: 200,
}
