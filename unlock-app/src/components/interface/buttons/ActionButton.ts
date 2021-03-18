import styled from 'styled-components'
import Media from '../../../theme/media'

interface ActionButtonProps {
  fontColor?: string
  fontActiveColor?: string
  activeColor?: string
}

export const ActionButton = styled.button<ActionButtonProps>`
  height: 60px;
  padding-left: 15px;
  padding-right: 15px;
  font-size: 16px;

  color: ${(props) =>
    props.disabled ? 'var(--white)' : props.fontColor || 'var(--white)'};

  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? 'auto' : 'pointer')};
  outline: none;
  transition: background-color 200ms ease;
  border: 1px solid;

  border-color: ${(props) => (props.disabled ? 'var(--grey)' : 'var(--green)')};

  background-color: ${(props) =>
    props.disabled ? 'var(--grey)' : props.color || 'var(--green)'};
  & :hover {
    color: ${(props) =>
      props.disabled
        ? 'var(--white)'
        : props.fontActiveColor || 'var(--activegreen)'};

    border-color: ${(props) =>
      props.disabled ? 'var(--grey)' : 'var(--activegreen)'};

    background-color: ${(props) =>
      props.disabled
        ? 'var(--grey)'
        : props.activeColor || 'var(--activegreen)'};
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
