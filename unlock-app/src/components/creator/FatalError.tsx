import React from 'react'
import styled from 'styled-components'

interface DefaultErrorProps {
  illustration: string
  title: string
  children: React.ReactNode
  critical: boolean
}
export const DefaultError = ({
  title,
  children,
  illustration,
  critical,
}: DefaultErrorProps) => (
  <Container>
    <img className="w-16" src={illustration} alt="error" />
    <Message critical={critical}>
      <h1>{title}</h1>
      {children}
    </Message>
  </Container>
)

const Container = styled.section`
  display: grid;
  row-gap: 16px;
  column-gap: 32px;
  border-radius: 4px;
  align-items: center;
  padding: 32px;
  padding-bottom: 40px;
  grid-template-columns: 50px repeat(auto-fill, minmax(1fr));
`

const Message = styled.div`
  display: grid;
  grid-gap: 16px;

  & > h1 {
    font-weight: bold;
    color: ${(props: { critical?: boolean }) =>
      props.critical ? 'var(--red)' : 'var(--grey)'};
    margin: 0px;
    padding: 0px;
  }

  & > p {
    margin: 0px;
    padding: 0px;
    font-size: 16px;
    color: var(--dimgrey);
  }
`
