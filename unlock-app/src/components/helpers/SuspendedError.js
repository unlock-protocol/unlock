import { Component } from 'react'
import * as UnlockPropTypes from '../../propTypes'

export default class SuspendedError extends Component {
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
    this.mounted = false
    this.clearTimeout = false
  }

  componentDidMount() {
    const { delay } = this.props
    this.mounted = true
    this.clearTimeout = setTimeout(() => {
      if (!this.mounted) return
      this.setState({ show: true })
    }, delay)
  }

  componentWillUnmount() {
    this.mounted = false
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout)
    }
  }

  render() {
    const { show } = this.state
    const { children } = this.props
    if (!show) return null
    return children
  }
}
