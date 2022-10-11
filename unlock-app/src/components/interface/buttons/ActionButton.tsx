import styled from 'styled-components'

interface ActionButtonProps {
  fontColor?: string
  fontActiveColor?: string
  activeColor?: string
  borderColor?: string
  activeBorderColor?: string
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
  border: 2px solid;

  border-color: ${(props) =>
    props.disabled ? 'var(--grey)' : props.borderColor || 'var(--green) '};

  background-color: ${(props) =>
    props.disabled ? 'var(--grey)' : props.color || 'var(--green)'};

  &:hover {
    color: ${(props) =>
      props.disabled
        ? 'var(--white) '
        : props.fontActiveColor || 'var(--white) '};

    border-color: ${(props) =>
      props.disabled
        ? 'var(--grey)'
        : props.activeBorderColor || 'var(--activegreen) '};

    background-color: ${(props) =>
      props.disabled
        ? 'var(--grey)'
        : props.activeColor || 'var(--activegreen) '};
  }
`
