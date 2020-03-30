import React from 'react'
import styled from 'styled-components'

const clickAction = (e, action) => {
  e.stopPropagation()
  if (action) action()
}


const Button = styled.button`
    background-color: #74ce63;
    font-size: 16px;
    color: #ffffff;
    font-family: "IBM Plex Sans", sans-serif;
    cursor: pointer;
    height: 48px;
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
    border-radius: 4px;
    outline: none;
    transition: background-color 200ms ease 0s;
    padding: 10px;
`;

export default Button
