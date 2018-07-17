import React from 'react'
import configure from '../config'

/**
 * Function which creates higher order component with the config
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

const config = configure(global)
const ConfigContext = React.createContext(config)

// This function takes a component...
export function withConfig(Component) {
  // ...and returns another component...
  return function componentWithConfig(props) {
    // ... and renders the wrapped component with the context config!
    // Notice that we pass through any additional props as well
    return (
      <ConfigContext.Consumer>
        {config => <Component {...props} config={config} />}
      </ConfigContext.Consumer>
    )
  }
}