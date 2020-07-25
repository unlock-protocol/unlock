import React from 'react'

/**
 * Function which creates higher order component with the config
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const ConfigContext = React.createContext()

/**
 * This creates an HOC from a component and injects the configuration.
 * It also triggers errors if constraints are not respected.
 * @param {*} Component
 */
export default function withConfig(Component) {
  function componentWithConfig(props) {
    return (
      <ConfigContext.Consumer>
        {(config) => <Component {...props} config={config} />}
      </ConfigContext.Consumer>
    )
  }

  componentWithConfig.getInitialProps = async (context) => {
    return {
      ...(Component.getInitialProps
        ? await Component.getInitialProps(context)
        : {}),
    }
  }

  return componentWithConfig
}
