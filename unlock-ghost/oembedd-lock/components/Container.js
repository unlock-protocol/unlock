import styled from "styled-components";

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  align-items: center;
  padding-top: 30px;
  padding-bottom: 20px;
  background-color: white;
`

export const Container = styled.div`
 @media (min-width: 768px) {
    margin-left: 20vw;
    margin-right: 20vw;
 }
`;

export const Navbar = styled.div`
  margin-top: 30px;
  margin-bottom: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (min-width: 768px) {
    margin-left: 20vw;
    margin-right: 20vw;
  }
`;

export const FieldGroup = styled.div`
  width: 80%;
`