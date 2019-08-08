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
  ${Media.phone`
    margin-top 20px;
  `};

  margin-bottom: 20px;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  font-style: light;
  line-height: 47px;
  grid-column: 1 3;
  color: var(--darkgrey);
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
