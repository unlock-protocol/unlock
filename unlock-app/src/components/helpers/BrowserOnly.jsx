import { Component } from 'react'

export default class BrowserOnly extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
    }
  }

  componentDidMount() {
    this.setState({ show: true })
  }

  render() {
    const { show } = this.state

    if (!show) return null

    const { children } = this.props
    return children
  }
}

