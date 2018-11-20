import styled from 'styled-components'

export const LockWrapper = styled.li`
  display: grid;
  justify-items: stretch;
  margin: 0px;
  padding: 0px;
  width: 200px;
  background-color: var(--white);
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  border-radius: 4px;
  height: 152px;
  grid-gap: 16px;
  border: 1px solid transparent;
  grid-template-rows: 40px 112px;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
`

export const LockHeader = styled.header`
  display: grid;
  font-weight: 300;
  justify-content: center;
  align-content: center;
  font-size: 20px;
  line-height: 20px;
  height: 40px;
  border-radius: 4px 4px 0px 0px;
  text-transform: capitalize;
`

export const LockBody = styled.div`
  display: grid;
  height: 64px;
  justify-content: center;
  align-content: center;
  text-align: center;
  padding: 0px 10px;
`

export const LockDetail = styled.div`
  white-space: nowrap;
  font-weight: ${props => (props.bold == true ? 'bold' : null)};
`

export const TransactionStatus = styled.p`
  display: grid;
  justify-content: center;
  align-content: center;
  text-align: center;
  color: var(--dimgrey);
  font-size: 15px;
  font-weight: 300;
  padding: 0px;
`

export const LockDetails = styled.div`
  display: grid;
  font-size: 15px;
  grid-template-columns: 1fr 1fr 1fr;
  color: var(--grey);
  font-weight: 300;
  grid-gap: 8px;
  justify-items: center;
  align-content: center;
`
