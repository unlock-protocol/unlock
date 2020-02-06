import styled from 'styled-components'

export const ActionButton = styled.button`
  background-color: ${props =>
    props.disabled ? 'var(--grey)' : 'var(--green)'};
  border: none;
  font-size: 20px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  cursor: ${props => (props.disabled ? 'auto' : 'pointer')};
  outline: none;
  transition: background-color 200ms ease;
  height: 60px;
  width: 100%;
  & :hover {
    background-color: ${props =>
      props.disabled ? 'var(--grey)' : 'var(--activegreen)'};
  }
`

export const LoadingButton = styled.button`
  background-color: var(--link);
  border: none;
  font-size: 20px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  cursor: ${props => (props.disabled ? 'auto' : 'pointer')};
  outline: none;
  height: 60px;
  width: 100%;
`

export default ActionButton
