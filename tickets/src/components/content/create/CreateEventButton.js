import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Media from '../../../theme/media'

export const CreateEventButton = ({ submitted }) => {
  if (!submitted) {
    return <SaveButton type="submit">Save Event</SaveButton>
  } else {
    return <VisitButton>Event Saved</VisitButton>
  }
}

CreateEventButton.propTypes = {
  submitted: PropTypes.bool,
}

CreateEventButton.defaultProps = {
  submitted: false,
}

export default CreateEventButton

const SaveButton = styled.button`
  background-color: var(--green);
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
    background-color: var(--activegreen);
  }
  height: 60px;
  ${Media.phone`
    width: 100%;
  `};
`

const VisitButton = styled(SaveButton)`
  background-color: var(--grey);
  & :hover {
    background-color: var(--grey);
  }
`
