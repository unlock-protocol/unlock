import React from 'react'
import UnlockPropTypes from '../../propTypes'

export class BlankLayout extends React.Component {
  constructor(props) {
    super(props)
    this.children = props.children
  }

  render() {
    return (
      <div className="layout-blank">
        {this.children}
      </div>
    )
  }
}

BlankLayout.propTypes = {
  children: UnlockPropTypes.children,
}

export default BlankLayout