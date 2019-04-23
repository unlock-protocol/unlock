import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Media from '../../theme/media'
import Layout from '../interface/Layout'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'

export default function HomeContent() {
  return (
    <GlobalErrorConsumer>
      <Layout noHeader>
        <Title>Unlock Tickets</Title>
        <Grid>
          <Description>
            <SubTitle>A simple way to sell tickets for an event.</SubTitle>
            <p>
              Tickets is built on top of Unlock, which is an easy to use access
              control protocol on the Ethereum blockchain.
            </p>
            <Link href="/create">
              <CreateButton>Create an event</CreateButton>
            </Link>
          </Description>
          <Illustration />
        </Grid>
      </Layout>
    </GlobalErrorConsumer>
  )
}

const CreateButton = styled.button`
  background-color: var(--green);
  border: none;
  font-size: 16px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: background-color 200ms ease;
  & :hover {
    background-color: var(--activegreen);
  }
  padding: 10px;
  align-self: end;
  height: 72px;
  width: 75%;
  ${Media.phone`
    width: 100%;
  `};
`

const Grid = styled.section`
  display: grid;
  grid-template-columns: 1fr 250px;
  grid-gap: 60px;
  ${Media.phone`
    grid-gap: 0;
    grid-template-columns: auto;
  `};
`
const Description = styled.div`
  p {
    font-size: 20px;
    font-weight: 100;
  }
`
const Illustration = styled.div`
  background-color: #e5e5e5;
`

const Title = styled.h1`
  margin-top: 200px;
  ${Media.phone`
    margin-top 20px;
  `};

  margin-bottom: 20px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 50px;
  font-style: light;
  line-height: 47px;
  grid-column: 1 3;
  color: var(--brand);
`

const SubTitle = styled.h2`
  font-family: IBM Plex Serif;
  font-style: normal;
  font-weight: 300;
  font-size: 32px;
  line-height: 42px;
  margin-top: 0;
  grid-column: 1 / span 3;
  color: var(--darkgrey);
`
