import React, { PureComponent } from 'react'
import styled from 'styled-components'
import Buttons from './buttons'

export default class Footer extends PureComponent {
  render() {
    return (
      <Container>
        <Buttons.About />
        <Buttons.Jobs />
        <Buttons.Github />
        <Colophon>Made with passion in Brooklyn, NY</Colophon>
      </Container>
    )
  }
}

Footer.propTypes = {
}

const Container = styled.footer`
  margin-top: 24px;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(3, 24px) 1fr;
  grid-auto-flow: column;
  align-items: center;
`

const Colophon = styled.span`
  justify-self: end;
  font-size: 12px;
  font-weight: 200;
  font-style: italic;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
`
