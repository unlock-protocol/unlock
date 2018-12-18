import { Component } from 'react'
import * as propTypes from 'prop-types'

export function delay(ms = 500) {
  let stop
  const delay = new Promise((resolve, reject) => {
    const cancel = setTimeout(() => resolve(), ms)
    stop = () => {
      clearTimeout(cancel)
      reject()
    }
    delay.suppressReactErrorLogging = true
    return { reject: stop, delay }
  })
}

export default class DelayDisplay extends Component {
  static propTypes = {
    component: propTypes.func.isRequired,
    fallback: propTypes.func,
  }

  static defaultProps = {
    fallback: () => null,
  }
  constructor(props) {
    super(props)
    this.state = {
      component: props.children,
      fallback: props.fallback,
    }
  }

  componentDidCatch(error) {}
}
