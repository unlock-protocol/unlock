import styled from 'styled-components'

export const Input = styled.input`
  height: 48px;
  width: 100%;
  border: thin var(--lightgrey) solid;
  border-radius: 4px;
  background-color: var(--lightgrey);
  font-size: 16px;
  padding: 0 8px;
  color: var(--darkgrey);
  margin-bottom: 16px;
`

export const Label = styled.label`
  font-size: 10px;
  line-height: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--grey);
  margin-bottom: 3px;
`

export const Select = styled.select`
  height: 48px;
  width: 100%;
  border: thin var(--lightgrey) solid;
  border-radius: 4px;
  background-color: var(--lightgrey);
  font-size: 16px;
  padding: 0 8px;
  color: var(--darkgrey);
  margin-bottom: 16px;
  appearance: none;
`

export const Button = styled.button`
  width: 100%;
  height: 48px;
  background-color: var(--green);
  border: none;
  border-radius: 4px;
  font-size: 20px;
  color: var(--white);
  margin-top: 16px;
`

export const NeutralButton = styled(Button)`
  background-color: var(--grey);
`

export const ErrorButton = styled(Button)`
  background-color: var(--sharpred);
`

export const LoadingButton = styled(Button)`
  background-color: var(--blue);
  & > span {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40%;
    text-align: center;
    margin: 0 auto;
  }
`

export const LinkButton = styled.a`
  cursor: pointer;
`
