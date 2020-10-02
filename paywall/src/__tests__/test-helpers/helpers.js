import React from 'react'
import PropTypes from 'prop-types'
import { ConfigContext } from '../../utils/withConfig'

const { Provider } = ConfigContext

export class Catcher extends React.Component {
  constructor() {
    super()

    this.state = {
      error: '',
    }
  }

  componentDidCatch(error) {
    this.setState({ error: error.message })
  }

  render() {
    const { children } = this.props
    const { error } = this.state
    if (error) return <div>{error}</div>
    return <>{children}</>
  }
}

export const wrapperMaker = (config) =>
  function wrapper(props) {
    return (
      <Catcher>
        <Provider value={config} {...props} />
      </Catcher>
    )
  }

export function expectError(cb, err) {
  // Record all errors.
  const topLevelErrors = []
  function handleTopLevelError(event) {
    topLevelErrors.push(event.error)
    // Prevent logging
    event.preventDefault()
  }
  window.addEventListener('error', handleTopLevelError)
  try {
    cb()
    expect(topLevelErrors).toHaveLength(1)
    expect(topLevelErrors[0].message).toBe(err)
  } finally {
    window.removeEventListener('error', handleTopLevelError)
  }
}

export function fakeLocksmithFetch(window, setResolver) {
  const fetchResponse = {
    json: () => ({
      then: (cb) => {
        setResolver(cb)
        return {
          catch: () => {},
        }
      },
    }),
  }

  window.fetch = jest.fn(() => {
    return {
      then: (first) => {
        return first(fetchResponse)
      },
    }
  })
}
Catcher.propTypes = {
  children: PropTypes.node.isRequired,
}
