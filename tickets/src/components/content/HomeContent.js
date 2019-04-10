import React from 'react'
import styled from 'styled-components'
import Layout from '../interface/Layout'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'

export default function HomeContent() {
  return (
    <GlobalErrorConsumer>
      <Layout title="Paywall" forContent>
        <section>
          <Title>Unlock Tickets</Title>
          <SubTitle>A simple way to sell tickets for an event.</SubTitle>
        </section>
      </Layout>
    </GlobalErrorConsumer>
  )
}

const Title = styled.h1`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 36px;
  font-style: light;
  line-height: 47px;
  grid-column: 1 3;
  color: var(--darkgrey);
`

const SubTitle = styled.h2`
  font-family: IBM Plex Serif;
  font-style: normal;
  font-weight: 300;
  font-size: 32px;
  line-height: 42px;
  grid-column: 1 / span 3;
  color: var(--darkgrey);
`
