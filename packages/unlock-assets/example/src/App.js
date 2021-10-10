import React from 'react'

import Svg from 'unlock-assets'

const App = () => {
  return (
    <section className="wrapper">
      {Object.keys(Svg.SvgComponents).map((name) => {
        return (
          <div className="well" key={name} name={name}>
            {React.createElement(Svg.SvgComponents[name])}
          </div>
        )
      })}
    </section>
  )
}

export default App
