import styled from 'styled-components'
import Media from '../../../theme/media'

export const ActionButton = styled.button`
  background-color: ${(props) =>
    props.disabled ? 'var(--grey)' : 'var(--green)'};
  border: none;
  font-size: 16px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? 'auto' : 'pointer')};
  outline: none;
  transition: background-color 200ms ease;
  & :hover {
    background-color: ${(props) =>
      props.disabled ? 'var(--grey)' : 'var(--activegreen)'};
  }
`

export const CreateLockButton = styled(ActionButton)`
  padding: 10px;
  align-self: end;
  height: 48px;
  ${Media.phone`
    display: none;
  `};
`

export const CancelCreateLockButton = styled(ActionButton)`
  padding: 10px;
  align-self: end;
  height: 48px;
  background-color: var(--yellow);
  & :hover {
    background-color: var(--red);
  }
  ${Media.phone`
    display: none;
  `};
`

export const AccountWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 144px;
  align-items: center;
`

export const LoadingButton = styled.button`
  background-color: var(--link);
  border: none;
  font-size: 20px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? 'auto' : 'pointer')};
  outline: none;
  height: 60px;
  width: 100%;
`
