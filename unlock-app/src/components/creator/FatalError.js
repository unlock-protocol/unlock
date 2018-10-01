import PropTypes from 'prop-types'

import React from 'react'
import styled from 'styled-components'

import Layout from '../interface/Layout'

export const FatalError = ({ title = 'Fatal Error', message = 'There was a fatal error.', illustration }) => {

  return (
    <Layout title="Creator Dashboard">
      <Container>
        <Image src={illustration} />
        <Message>
          <h1>{title}</h1>
          <p>{message}</p>
        </Message>
      </Container>
    </Layout>
  )
}

FatalError.propTypes = {
  illustration: PropTypes.string,
  message: PropTypes.string,
  title: PropTypes.string,
}

const Container = styled.section`
  display: grid;
  grid-template-columns: 72px 1fr;
  row-gap: 16px;
  column-gap: 32px;
  border: solid 1px var(--lightgrey);
  border-radius: 4px;
  align-items: center;
  padding: 32px;
  padding-bottom: 40px;
  padding-right: 160px;
`

const Image = styled.img``

const Message = styled.div`
  display: grid;
  grid-gap: 16px;

  &>h1 {
    font-weight: bold;
    color: var(--red);
    margin: 0px;
    padding: 0px;
  }

  &>p {
    margin: 0px;
    padding: 0px;
    font-size: 16px;
      color: var(--dimgrey);
  }

`
