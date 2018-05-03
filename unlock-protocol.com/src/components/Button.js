import React from 'react'

const Button = (props) => (
  <a className={props.className + ' button'} href={props.href}>{props.text}</a>
)

export default Button
