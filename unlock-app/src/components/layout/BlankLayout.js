import React from 'react'

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

export default BlankLayout