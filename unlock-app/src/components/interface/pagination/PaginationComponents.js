import styled from 'styled-components'

export const ArrowGroup = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  color: #72accf;
  font-weight: bold;
`

export const ArrowGroupDisabled = styled.div`
  display: flex;
  flex-direction: row;
  cursor: default;
  color: gray;
  font-weight: bold;
`

export const LeftArrow = styled.div`
  margin-right: 20px;
`

export const RightArrow = styled.div`
  margin-left: 20px;
`

export const PageGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: spread
  cursor: pointer;
  color: #72ACCF;
  font-weight: bold;
`

export const PageNumber = styled.div`
  margin: 0 10px;
  cursor: pointer;
`

export const PageNumberActive = styled.div`
  margin: 0 10px;
  color: red;
`

export const LockDivider = styled.div`
  width: 99%;
  height: 1px;
  background-color: var(--lightgrey);
  margin-bottom: 10px;
`
