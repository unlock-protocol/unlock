import React from 'react'
import styled from 'styled-components'

const Footer = () => (
  <Container>
    <Colophon>Made with passion in Brooklyn, NY</Colophon>
  </Container>
)

export default Footer

const Container = styled.footer`
  margin-top: 24px;
  margin-bottom: 24px;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr;
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
