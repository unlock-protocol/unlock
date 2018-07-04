import React from 'react'

const Button = (props) => (
  <a className={props.className + ' button'} href={props.href}>
    {props.children &&
      <i className="icon">
        {props.children}
      </i>
    }
    {props.text}
  </a>
)

export default Button
