import styled from 'styled-components'
import Select from 'react-select'
import Media from '../../theme/media'

export const StyledSelect = styled(Select)`
  background-color: var(--offwhite);
  border-radius: 4px;

  .select-option__control {
    background-color: var(--offwhite);
    border: none;
    height: 60px;
    border-radius: 4px;
  }
  .select-option__indicator-separator {
    display: none;
  }
  .select-option__single-value {
    color: var(--darkgrey);
    font-size: 20px;
  }
`

export const Steps = styled.ol`
  margin-top: 30px;
  padding-right: 20px;
  font-family: 'IBM Plex Sans';
  font-weight: 300;
  font-size: 24px;
  color: var(--grey);
`

export const Step = styled.li`
  margin-bottom: 60px;
`

export const Fieldset = styled.div`
  padding: 0;
  border: none;

  ${Media.nophone`
    display: grid;
    grid-gap: 30px;
    grid-template-columns: repeat(2, minmax(250px, 1fr));
    align-items: top;
  `}
`

export const Field = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 25px auto;
  align-items: top;
  ${Media.phone`
    margin-bottom: 15px;
  `}
`

export const Text = styled.label`
  font-size: 13px;
  color: var(--darkgrey);
`

export const Label = styled(Text)`
  text-transform: uppercase;
`

export const Cta = styled.a`
  clear: both;
  font-size: 16px;
  color: var(--link);
`

export const Title = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: normal;
  margin-bottom: 0px;
  ${Media.nophone`
    padding-left: 20px;
  `}
`

export const TextArea = styled.textarea`
  height: 60px;
  border: none;
  background-color: var(--offwhite);
  border-radius: 4px;
  padding: 16px 10px;
  font-size: 16px;
  font-family: 'IBM Plex Sans';
  height: 150px;
  color: var(--darkgrey);
`

export const Input = styled.input`
  height: 60px;
  border: none;
  background-color: var(--offwhite);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
  color: var(--darkgrey);
`

export const Date = styled.h2`
  font-family: 'IBM Plex Sans', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  color: var(--red);
  margin-top: 0px;
  margin-bottom: 0px;
  ${Media.nophone`
    padding-left: 20px;
  `}
`

export const Time = styled.span`
  border: 0;
  border-left: var(--grey) solid 2px;
  padding-left: 10px;
  margin-left: 10px;
`

export const Location = styled.p`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  margin: 0px;
  padding-left: 20px;
`

export const Link = styled.li`
  margin-top: 15px;
  font-weight: 200;
  list-style: none;
  background: url(${props => props.icon}) no-repeat;
  padding-left: 40px;
`

export const Links = styled.ul`
  font-size: 24px;
  padding: 0px;
`

export const DescriptionPara = styled.p`
  margin-bottom: 1em;
`

export const DescriptionWrapper = styled.div`
  font-size: 24px;
  font-family: 'IBM Plex Sans', sans-serif;
  p {
    padding: 0.5em 0;
    margin: 0px;
  }
`

export const Form = styled.form`
  display: grid;
  grid-gap: 10px;
`

export const SendButton = styled.input`
  background-color: ${props =>
    props.disabled ? 'var(--grey)' : 'var(--green)'};
  border: none;
  font-size: 16px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: background-color 200ms ease;
  & :hover {
    background-color: ${props =>
      props.disabled ? 'var(--grey)' : 'var(--activegreen)'};
  }
  height: 60px;
  ${Media.phone`
width: 100%;
`};
`

export const TicketInfo = styled.div`
  display: grid;
  grid-gap: 20px;

  ${Media.phone`
justify-content: center;
`}
`
