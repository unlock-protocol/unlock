import styled from 'styled-components'

export const Box = styled.div`
  width: 100%;
  border: thin var(--lightgrey) solid;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items:center;
  margin-top: 30px;
  margin-bottom: 25px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 40px 0px;
    transition: box-shadow 100ms ease 0s;
    border-radius: 4px;
    animation: 400ms ease 0s 1 normal none running slideIn;
`;
