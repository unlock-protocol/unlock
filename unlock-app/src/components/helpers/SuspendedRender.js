import { Component } from 'react'
import * as UnlockPropTypes from '../../propTypes'

export default class SuspendedRender extends Component {
  static propTypes = {
    children: UnlockPropTypes.element.isRequired,
    delay: UnlockPropTypes.delay,
  }

  static defaultProps = {
    delay: 200,
  }

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
