import React from 'react'
import { Markdown } from 'react-showdown'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import showdownHighlight from 'showdown-highlight'
import { MembershipContext } from '../../membershipContext'

export class BlogPost extends React.Component {
  constructor(props) {
    super(props)
    this.commentScript = null
    this.loadCommmentsIfMember = this.loadCommmentsIfMember.bind(this)
    this.scripts = []
  }

  componentDidMount() {
    this.loadCommmentsIfMember()
    // Load scripts if any!
    const { scripts } = this.props
    this.scripts = scripts.map((url) => {
      const element = document.createElement('script')
      element.async = true
      element.src = url
      element.charset = 'utf-8'
      document.body.appendChild(element)
      return element
    })
  }

  componentDidUpdate() {
    this.loadCommmentsIfMember()
  }

  componentWillUnmount() {
    this.scripts.forEach((element) => {
      element.parentElement.removeChild(element)
    })
    this.scripts = []
  }

  loadCommmentsIfMember() {
    const { isMember } = this.context
    if (isMember === 'yes' && !this.commentScript) {
      this.commentScript = document.createElement('script')
      this.commentScript.src = 'https://cdn.commento.io/js/commento.js'
      this.commentScript.async = true
      this.commentScript.setAttribute('data-no-fonts', false)
      document.body.appendChild(this.commentScript)
    }
  }

  render() {
    const { isMember, becomeMember } = this.context
    const {
      title,
      subTitle,
      publishDate,
      body,
      authorName,
      nonMembersOnly,
      membersOnly,
      latestUpdateDate,
    } = this.props

    const extensions = [showdownHighlight({ pre: true })[0]]
    return (
      <Post>
        <Title>{title}</Title>
        {subTitle && <SubTitle>{subTitle}</SubTitle>}
        <Byline>
          <AuthorName>{authorName}</AuthorName>&nbsp;
          <PublishDate>On {publishDate}</PublishDate>
        </Byline>
        <Body>
          <Markdown extensions={extensions} tables="true" markup={body} />
          {isMember === 'yes' && <Markdown markup={membersOnly} />}
          {isMember === 'no' && (
            <Button onClick={becomeMember}>
              <Markdown markup={nonMembersOnly} />
            </Button>
          )}
          {latestUpdateDate && (
            <p>
              <em>This was post was last updated on {latestUpdateDate}</em>
            </p>
          )}
        </Body>
        <CommentSeparator />
        {isMember === 'yes' && <Comments id="commento" />}
        {isMember === 'no' && (
          <Comments>
            Become <Button onClick={becomeMember}>a member</Button> to read or
            leave comments!
          </Comments>
        )}
      </Post>
    )
  }
}

BlogPost.contextType = MembershipContext

BlogPost.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  body: PropTypes.string.isRequired,
  authorName: PropTypes.string,
  publishDate: PropTypes.string.isRequired,
  latestUpdateDate: PropTypes.string,
  nonMembersOnly: PropTypes.string,
  membersOnly: PropTypes.string,
  scripts: PropTypes.arrayOf(PropTypes.string),
}

BlogPost.defaultProps = {
  authorName: 'Unlock team',
  subTitle: '',
  nonMembersOnly: '',
  membersOnly: '',
  scripts: [],
  latestUpdateDate: null,
}

export default BlogPost

const CommentSeparator = styled.hr.attrs({ id: 'comments' })`
  margin-top: 50px;
  border: none;
  border-top: 1px solid var(--lightgrey);
  margin-bottom: 20px;
`

const Comments = styled.section`
  font-weight: 300;
  line-height: 28px;
  font-size: 16px;
`

const Post = styled.div`
  width: 100%;
  max-width: 730px;
  margin: auto;
  font-family: 'IBM Plex Serif', serif;
`

const Title = styled.h1`
  margin-bottom: 0;
  color: var(--darkgrey);
  font-weight: 700;
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  font-size: 36px;
`

export const Byline = styled.div`
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  color: var(--darkgrey);
  font-size: 12px;
  line-height: 12px;
  margin-top: 0px;
  margin-bottom: 35px;
`

const SubTitle = styled.h2`
  margin-top: 10px;
  font-family: 'IBM Plex Serif';
  font-weight: 300;
  font-size: 32px;
  line-height: 42px;
  color: var(--dimgrey);
`

const Body = styled.div`
  color: var(--darkgrey);
  font-weight: 300;
  line-height: 28px;
  font-size: 16px;

  strong {
    font-weight: 800;
  }

  p {
    margin-top: 0;
  }

  h2 {
    font-weight: 800;
    font-family: 'IBM Plex Sans', Helvetica, sans-serif;
    margin-bottom: 0;
    padding-bottom: 0;
    font-size: 18px;
  }

  img {
    max-width: 100%;
  }

  pre,
  code {
    max-width: 90vw;
    overflow-x: scroll;
  }

  pre {
  }

  blockquote {
    font-style: italic;
    margin-left: 0px;
    padding-left: 20px;
    border-left: 2px solid var(--lightgrey);
    color: var(--slate);
  }

  /* Captions */
  img + em {
    display: block;
    font-size: 0.7em;
    margin-bottom: 20px;
    text-align: center;
  }

  th,
  td {
    padding: 5px;
  }

  .twitter-tweet {
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
  }
`

export const AuthorName = styled.h3`
  font-family: 'IBM Plex Serif';
  font-weight: 300;
  font-size: 16px;
  line-height: 22px;
  color: var(--link);
  display: inline;
`

export const PublishDate = styled.span`
  font-family: 'IBM Plex Mono';
  font-weight: 300;
  font-size: 16px;
  line-height: 22px;
  color: var(--grey);
`

const Button = styled.a`
  cursor: pointer;
`
