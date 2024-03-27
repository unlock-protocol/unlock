import React from 'react'
import SearchBar from '@theme-original/SearchBar'
import AskCookbook from '@cookbookdev/docsbot/react'

export default function SearchBarWrapper(props) {
  return (
    <>
      <SearchBar {...props} />
      <AskCookbook
        apiKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWQ5OTljM2Q0NWUzNzIxM2UxZDgzMGMiLCJpYXQiOjE3MDg3NTk0OTEsImV4cCI6MjAyNDMzNTQ5MX0.2DgWnOpRQgPWfQeIOH5XRP3v1v_XDU5RSy6pqUUwwVg"
        noFastMode
      />
    </>
  )
}
