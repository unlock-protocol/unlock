import React, { PureComponent } from 'react'
import styled from 'styled-components'
import Icons from './icons'

export default class Footer extends PureComponent {
  render() {
    return (
      <Container>
        <Button><Icons.About fill={'white'} /></Button>
        <Button><Icons.Jobs fill={'white'} /></Button>
        <Button><Icons.Github fill={'white'} /></Button>
        <Colophon>Made with passion in Brooklyn, NY</Colophon>
      </Container>
    )
  }
}

Footer.propTypes = {
}

const Container = styled.footer`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(3, 24px) 1fr;
  grid-auto-flow: column;
  align-items: center;
`

const Button = styled.a`
  background-color: var(--grey);
  border-radius: 50%;
  height: 24px;
  display: grid;
`

const Colophon = styled.span`
  justify-self: end;
  font-size: 12px;
  font-weight: 200;
  font-style: italic;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
`
