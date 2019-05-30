import styled from 'styled-components'

const Greyout = styled.div`
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: var(--alwaysontop);
  & > * {
    max-height: 100%;
    overflow-y: scroll;
  }
`

export default Greyout
