import styled from 'styled-components'

export const LockRow = styled.div`
  box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  grid-gap: 8px;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  color: var(--slate);
  padding: 10px 0 10px 0;
  height: 64px;
`

export const LockIcon = styled.div`
  padding-left: 5px;
`

export const LockName = styled.div`
  color: var(--link);
  font-weight: 600;
`

export const LockAddress = styled.div`
  color: var(--grey);
  font-weight: 200;
  font-size: 0.75em;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LockDuration = styled.div`
`

export const LockKeys = styled.div`
`

export const LockValue = styled.div`
`

/* Saving for use with sub-values that need to be added in a future PR
export const LockValueSub = styled.div`
  font-size: 0.6em;
  color: var(--grey);
  margin-top: 5px;
`
*/

export const LockValueMain = styled.div`
  font-weight: bold;
`

export const LockValueEth = styled.div`
`

/* Saving for use with sub-values that need to be added in a future PR
export const LockValueUsd = styled.div`
  &:before {
    content: "$ ";
  }
`
*/

export const LockCurrency = styled.span`
  font-size: 0.7em;
`

export const LockIconBar = styled.div`
  text-align: right;
  padding-right: 10px;
  padding: 0;
  margin: 0;
  font-size: 28px;
`

export const LockIconBarIcon = styled.div`
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
`

export const LockStatus = styled.div`
  padding: -10px;
  margin: 0;
  margin-top: -10px;
  margin-bottom: -22px;
  background-color: var(--lightgrey);
  text-align: center;
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 200;
  color: var(--grey);
`

export const LockStatusLabel = styled.div`
  margin-top: 30px;
`
