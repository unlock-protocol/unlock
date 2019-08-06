import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Media from '../../../theme/media'

export const CreateEventButton = ({ disabled, submitted, saved }) => {
  if (disabled) {
    return <SaveButton disabled>Save Event</SaveButton>
  } else if (!submitted && !saved) {
    return <SaveButton type="submit">Save Event</SaveButton>
  } else if (!saved) {
    return <SaveButton disabled>Saving...</SaveButton>
  } else {
    return <SaveButton disabled>Event Saved</SaveButton>
  }
}

CreateEventButton.propTypes = {
  submitted: PropTypes.bool,
  saved: PropTypes.bool,
}

CreateEventButton.defaultProps = {
  submitted: false,
  saved: false,
}

export default CreateEventButton

const SaveButton = styled.button`
  background-color: ${props =>
    props.disabled ? 'var(--grey)' : 'var(--green)'};

  background-color: ${props =>
    props.disabled ? 'var(--grey)' : 'var(--activegreen)'};

  & :hover {
    background-color: var(--grey);
  }

  border: none;
  font-size: 16px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: background-color 200ms ease;
  height: 60px;
  ${Media.phone`
    width: 100%;
  `};
`
