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
  grid-gap: 0px;
  border: 1px solid transparent;
  background-clip: padding-box;
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
  padding: 0px;
`

export const LockBody = styled.div`
  display: grid;
  height: 120px;
  justify-content: center;
  justify-items: center;
  text-align: center;
  align-items: start;
  padding: 0px;
  grid-template-rows: 40px 30px;
  grid-gap: 8px;
  padding-top: 16px;
`

export const LockDetail = styled.div`
  white-space: nowrap;
  font-weight: ${props => (props.bold == true ? 'bold' : null)};
  align-content: center;
  align-items: center;
  align-self: center;
`

export const TransactionStatus = styled.div`
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
  grid-auto-columns: min-content;
  grid-auto-flow: column;
  color: var(--grey);
  font-weight: 300;
  grid-gap: 4px;
  align-self: center;
  justify-items: center;
  align-content: center;
`

export const LockName = styled(LockDetail)`
  white-space: normal;
  font-size: 12px;
`
