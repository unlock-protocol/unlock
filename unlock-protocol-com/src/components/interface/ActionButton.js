import styled from 'styled-components'

const ActionButton = styled.button`
  background-color: ${(props) =>
    props.disabled ? 'var(--grey)' : props.backgroundColor || 'var(--green)'};
  border: none;
  font-size: 16px;
  color: ${(props) => props.textColor || 'var(--darkgrey)'};
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? 'auto' : 'pointer')};
  outline: none;
  transition: background-color 200ms ease;

  &:hover {
    color: ${(props) => props.hoverTextColor || 'var(--darkgrey)'};
    background-color: ${(props) =>
      props.hoverBackgroundColor || 'var(--activegreen)'};
  }
`

export default ActionButton
